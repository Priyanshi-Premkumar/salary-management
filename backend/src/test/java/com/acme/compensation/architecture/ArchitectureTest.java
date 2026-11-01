package com.acme.compensation.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

@AnalyzeClasses(packages = "com.acme.compensation", importOptions = {ImportOption.DoNotIncludeTests.class})
public class ArchitectureTest {

    @ArchTest
    static final ArchRule controllers_should_not_depend_on_repositories =
            noClasses().that().resideInAPackage("..api..")
                    .should().dependOnClassesThat().haveSimpleNameEndingWith("Repository");

    @ArchTest
    static final ArchRule domain_should_not_depend_on_spring_web =
            noClasses().that().resideInAPackage("..domain..")
                    .should().dependOnClassesThat().resideInAnyPackage(
                            "org.springframework.web..",
                            "jakarta.servlet.."
                    );

    @ArchTest
    static final ArchRule domain_should_not_depend_on_api =
            noClasses().that().resideInAPackage("..domain..")
                    .should().dependOnClassesThat().resideInAPackage("..api..");

    @ArchTest
    static final ArchRule layered_architecture_rules =
            layeredArchitecture()
                    .consideringAllDependencies()
                    .layer("Domain").definedBy("..domain..")
                    .layer("Application").definedBy("..application..")
                    .layer("Infrastructure").definedBy("..infrastructure..")
                    .layer("Api").definedBy("..api..")
                    .layer("Shared").definedBy("..shared..")
                    .whereLayer("Domain").mayOnlyBeAccessedByLayers("Application", "Infrastructure", "Api", "Shared")
                    .whereLayer("Application").mayOnlyBeAccessedByLayers("Infrastructure", "Api", "Shared")
                    .whereLayer("Infrastructure").mayOnlyBeAccessedByLayers("Api", "Shared")
                    .whereLayer("Api").mayNotBeAccessedByAnyLayer();

    @ArchTest
    static final ArchRule no_cycles_between_packages =
            com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices()
                    .matching("com.acme.compensation.(*)..")
                    .should().beFreeOfCycles();
}
