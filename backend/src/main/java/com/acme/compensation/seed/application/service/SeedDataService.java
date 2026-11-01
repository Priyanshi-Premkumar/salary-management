package com.acme.compensation.seed.application.service;

import com.acme.compensation.seed.application.port.out.SeedRepositoryPort;
import com.acme.compensation.seed.application.port.out.SeedRepositoryPort.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeedDataService {

    private final SeedRepositoryPort seedRepositoryPort;
    private final PasswordEncoder passwordEncoder;

    public record SeedResult(
            boolean executed,
            String message,
            long employeeCount,
            long compensationCount,
            long auditLogCount,
            long durationMillis
    ) {}

    public SeedResult seedDatabase(boolean force) {
        long startTime = System.currentTimeMillis();
        long existingCount = seedRepositoryPort.getEmployeeCount();

        if (existingCount >= 10000 && !force) {
            log.info("Database already contains {} employees. Skipping seed. (Use force=true to re-seed)", existingCount);
            return new SeedResult(
                    false,
                    "Database already contains " + existingCount + " employees. Skipping seed. Use force=true to overwrite.",
                    existingCount,
                    0,
                    0,
                    System.currentTimeMillis() - startTime
            );
        }

        if (existingCount > 0 && force) {
            log.info("Force flag is true. Cleaning existing data...");
            seedRepositoryPort.cleanAllData();
        }

        log.info("Seeding system default users...");
        seedDefaultUsers();
        Long hrUserId = seedRepositoryPort.findUserIdByEmail("hrmanager@acme.com");

        log.info("Generating 10,000 deterministic employees, compensation records, and audit logs...");
        Random random = new Random(42L);

        List<SeedEmployeeRecord> employees = new ArrayList<>(10000);
        List<SeedCompensationRecord> compensations = new ArrayList<>(14000);
        List<SeedAuditLogRecord> auditLogs = new ArrayList<>(4000);

        // Country quotas: 3500 India, 2500 USA, 1500 Germany, 1500 UK, 1000 UAE
        int[] quotas = {3500, 2500, 1500, 1500, 1000};
        String[] countries = {"India", "USA", "Germany", "United Kingdom", "United Arab Emirates"};
        String[] currencies = {"INR", "USD", "EUR", "GBP", "AED"};

        long employeeId = 1L;

        for (int c = 0; c < countries.length; c++) {
            String country = countries[c];
            String currency = currencies[c];
            int count = quotas[c];

            for (int i = 0; i < count; i++) {
                String code = String.format("EMP-%s-%05d", currency, i + 1);
                String firstName = getRandomFirstName(country, random);
                String lastName = getRandomLastName(country, random);
                String email = String.format("%s.%s.%s@acme.com",
                        firstName.toLowerCase().replaceAll("[^a-z]", ""),
                        lastName.toLowerCase().replaceAll("[^a-z]", ""),
                        code.toLowerCase().replace("-", ""));

                String department = getRandomDepartment(random);
                String designation = getRandomDesignation(department, random);
                String phone = generatePhone(country, random);
                String status = (random.nextDouble() < 0.95) ? "ACTIVE" : (random.nextBoolean() ? "RESIGNED" : "TERMINATED");

                // Joining date between 2020-01-15 and 2025-10-31
                int daysOffset = random.nextInt(2100);
                LocalDate joiningDate = LocalDate.of(2020, 1, 15).plusDays(daysOffset);

                employees.add(new SeedEmployeeRecord(
                        employeeId,
                        code,
                        firstName,
                        lastName,
                        email,
                        phone,
                        country,
                        department,
                        designation,
                        status,
                        joiningDate
                ));

                // Generate initial compensation
                BigDecimal initialBase = generateBaseSalary(currency, random);
                BigDecimal initialBonus = initialBase.multiply(BigDecimal.valueOf(0.05 + (random.nextDouble() * 0.15)))
                        .setScale(2, RoundingMode.HALF_UP);

                // Determine if this employee has historical salary revisions (~30% of employees)
                boolean hasRevision = joiningDate.isBefore(LocalDate.of(2024, 6, 1)) && (random.nextDouble() < 0.40);

                if (hasRevision) {
                    // 1st Revision: 1-2 years after joining
                    LocalDate revisionDate1 = joiningDate.plusMonths(12 + random.nextInt(12));
                    if (revisionDate1.isAfter(LocalDate.of(2026, 1, 1))) {
                        revisionDate1 = LocalDate.of(2025, 4, 1);
                    }

                    // Initial record ended the day before revision
                    compensations.add(new SeedCompensationRecord(
                            employeeId,
                            initialBase,
                            initialBonus,
                            currency,
                            joiningDate,
                            revisionDate1.minusDays(1)
                    ));

                    // Revised salary: +8% to +20%
                    double increasePercent = 0.08 + (random.nextDouble() * 0.14);
                    BigDecimal revisedBase1 = initialBase.multiply(BigDecimal.valueOf(1.0 + increasePercent))
                            .setScale(2, RoundingMode.HALF_UP);
                    BigDecimal revisedBonus1 = revisedBase1.multiply(BigDecimal.valueOf(0.08 + (random.nextDouble() * 0.12)))
                            .setScale(2, RoundingMode.HALF_UP);

                    // Check for possible 2nd revision (~20% of revised)
                    boolean hasSecondRevision = revisionDate1.isBefore(LocalDate.of(2025, 3, 1)) && (random.nextDouble() < 0.25);

                    if (hasSecondRevision) {
                        LocalDate revisionDate2 = revisionDate1.plusMonths(12);
                        // Record 2
                        compensations.add(new SeedCompensationRecord(
                                employeeId,
                                revisedBase1,
                                revisedBonus1,
                                currency,
                                revisionDate1,
                                revisionDate2.minusDays(1)
                        ));
                        // Audit log for revision 1
                        auditLogs.add(new SeedAuditLogRecord(
                                employeeId,
                                hrUserId,
                                "hrmanager@acme.com",
                                initialBase,
                                revisedBase1,
                                initialBonus,
                                revisedBonus1,
                                currency,
                                getRandomReason(random),
                                revisionDate1,
                                revisionDate1.atStartOfDay(ZoneOffset.UTC).toInstant()
                        ));

                        // Record 3 (current)
                        BigDecimal revisedBase2 = revisedBase1.multiply(BigDecimal.valueOf(1.0 + (0.05 + random.nextDouble() * 0.10)))
                                .setScale(2, RoundingMode.HALF_UP);
                        BigDecimal revisedBonus2 = revisedBase2.multiply(BigDecimal.valueOf(0.10))
                                .setScale(2, RoundingMode.HALF_UP);

                        compensations.add(new SeedCompensationRecord(
                                employeeId,
                                revisedBase2,
                                revisedBonus2,
                                currency,
                                revisionDate2,
                                null
                        ));

                        // Audit log for revision 2
                        auditLogs.add(new SeedAuditLogRecord(
                                employeeId,
                                hrUserId,
                                "hrmanager@acme.com",
                                revisedBase1,
                                revisedBase2,
                                revisedBonus1,
                                revisedBonus2,
                                currency,
                                "Annual performance review cycle",
                                revisionDate2,
                                revisionDate2.atStartOfDay(ZoneOffset.UTC).toInstant()
                        ));
                    } else {
                        // Current compensation record
                        compensations.add(new SeedCompensationRecord(
                                employeeId,
                                revisedBase1,
                                revisedBonus1,
                                currency,
                                revisionDate1,
                                null
                        ));

                        auditLogs.add(new SeedAuditLogRecord(
                                employeeId,
                                hrUserId,
                                "hrmanager@acme.com",
                                initialBase,
                                revisedBase1,
                                initialBonus,
                                revisedBonus1,
                                currency,
                                getRandomReason(random),
                                revisionDate1,
                                revisionDate1.atStartOfDay(ZoneOffset.UTC).toInstant()
                        ));
                    }
                } else {
                    // Single current compensation from joining date
                    compensations.add(new SeedCompensationRecord(
                            employeeId,
                            initialBase,
                            initialBonus,
                            currency,
                            joiningDate,
                            null
                    ));
                }

                employeeId++;
            }
        }

        log.info("Executing batch inserts into PostgreSQL...");
        long insertStart = System.currentTimeMillis();

        seedRepositoryPort.batchInsertEmployees(employees);
        seedRepositoryPort.batchInsertCompensations(compensations);
        seedRepositoryPort.batchInsertAuditLogs(auditLogs);
        seedRepositoryPort.updateSequences();

        long totalDuration = System.currentTimeMillis() - startTime;
        long batchDuration = System.currentTimeMillis() - insertStart;
        log.info("Batch seeding completed in {} ms (Batch insert took {} ms). Total employees: {}, compensations: {}, audit logs: {}",
                totalDuration, batchDuration, employees.size(), compensations.size(), auditLogs.size());

        return new SeedResult(
                true,
                "Successfully seeded " + employees.size() + " employees, " + compensations.size() + " compensation records, and " + auditLogs.size() + " audit logs.",
                employees.size(),
                compensations.size(),
                auditLogs.size(),
                totalDuration
        );
    }

    private void seedDefaultUsers() {
        String adminHash = passwordEncoder.encode("Admin@123");
        String managerHash = passwordEncoder.encode("Manager@123");
        String executiveHash = passwordEncoder.encode("Executive@123");
        List<SeedUserRecord> users = List.of(
                new SeedUserRecord("admin@acme.com", adminHash, "ROLE_ADMIN", true),
                new SeedUserRecord("hrmanager@acme.com", managerHash, "ROLE_HR_MANAGER", true),
                new SeedUserRecord("executive@acme.com", executiveHash, "ROLE_EXECUTIVE", true)
        );
        seedRepositoryPort.insertUsersIfNotExist(users);
    }

    private BigDecimal generateBaseSalary(String currency, Random random) {
        return switch (currency) {
            case "INR" -> BigDecimal.valueOf(500000 + random.nextInt(4000000)).setScale(2, RoundingMode.HALF_UP);
            case "USD" -> BigDecimal.valueOf(65000 + random.nextInt(155000)).setScale(2, RoundingMode.HALF_UP);
            case "EUR" -> BigDecimal.valueOf(50000 + random.nextInt(100000)).setScale(2, RoundingMode.HALF_UP);
            case "GBP" -> BigDecimal.valueOf(45000 + random.nextInt(95000)).setScale(2, RoundingMode.HALF_UP);
            case "AED" -> BigDecimal.valueOf(120000 + random.nextInt(260000)).setScale(2, RoundingMode.HALF_UP);
            default -> BigDecimal.valueOf(70000).setScale(2, RoundingMode.HALF_UP);
        };
    }

    private String getRandomReason(Random random) {
        String[] reasons = {
                "Annual merit increase",
                "Promotion to Senior tier",
                "Market competitive adjustment",
                "Exceptional performance bonus & raise",
                "Departmental compensation alignment",
                "Role scope expansion"
        };
        return reasons[random.nextInt(reasons.length)];
    }

    private String getRandomDepartment(Random random) {
        double p = random.nextDouble();
        if (p < 0.30) return "Engineering";
        if (p < 0.48) return "Sales";
        if (p < 0.60) return "Customer Success";
        if (p < 0.70) return "Product";
        if (p < 0.80) return "Marketing";
        if (p < 0.88) return "Operations";
        if (p < 0.94) return "Finance";
        if (p < 0.98) return "Human Resources";
        return "Legal";
    }

    private String getRandomDesignation(String department, Random random) {
        String[] levels = {"Associate", "Specialist", "Senior", "Lead", "Staff", "Manager", "Director"};
        String level = levels[random.nextInt(levels.length)];
        return switch (department) {
            case "Engineering" -> level + " Software Engineer";
            case "Product" -> level + " Product Manager";
            case "Sales" -> level + " Account Executive";
            case "Marketing" -> level + " Marketing Specialist";
            case "Customer Success" -> level + " Customer Success Manager";
            case "Operations" -> level + " Operations Specialist";
            case "Finance" -> level + " Financial Analyst";
            case "Human Resources" -> level + " HR Business Partner";
            case "Legal" -> level + " Corporate Counsel";
            default -> level + " Specialist";
        };
    }

    private String generatePhone(String country, Random random) {
        int n1 = 100 + random.nextInt(900);
        int n2 = 1000 + random.nextInt(9000);
        return switch (country) {
            case "India" -> "+91 98" + (10000000 + random.nextInt(89999999));
            case "USA" -> "+1 (" + (200 + random.nextInt(700)) + ") " + n1 + "-" + n2;
            case "Germany" -> "+49 30 " + (1000000 + random.nextInt(8999999));
            case "United Kingdom" -> "+44 20 " + (70000000 + random.nextInt(29999999));
            case "United Arab Emirates" -> "+971 4 " + (2000000 + random.nextInt(7999999));
            default -> "+1 555-0100";
        };
    }

    private String getRandomFirstName(String country, Random random) {
        String[] names = switch (country) {
            case "India" -> new String[]{"Aarav", "Aditi", "Amit", "Ananya", "Deepak", "Divya", "Ishaan", "Kavita", "Karan", "Meera", "Neha", "Nikhil", "Pooja", "Pranav", "Priya", "Rahul", "Rajesh", "Rhea", "Rohan", "Sanjay", "Shreya", "Siddharth", "Sneha", "Sunita", "Tarun", "Varun", "Vikram", "Zara"};
            case "USA" -> new String[]{"Alex", "Brandon", "Christopher", "David", "Emily", "Ethan", "Hannah", "James", "Jessica", "John", "Jordan", "Joshua", "Lauren", "Liam", "Matthew", "Megan", "Michael", "Olivia", "Rachel", "Robert", "Samantha", "Sarah", "Taylor", "Thomas", "William"};
            case "Germany" -> new String[]{"Alexander", "Ben", "Elias", "Felix", "Hannah", "Jonas", "Leon", "Lukas", "Marie", "Maximilian", "Mia", "Noah", "Paul", "Sophie", "Tim", "Anna", "David", "Emma", "Jan", "Laura", "Lena", "Moritz", "Niklas", "Philipp"};
            case "United Kingdom" -> new String[]{"Amelia", "Charlie", "Charlotte", "Daniel", "Ella", "George", "Grace", "Harry", "Isla", "Jack", "Jacob", "James", "Leo", "Lily", "Lucas", "Noah", "Oliver", "Olivia", "Oscar", "Poppy", "Thomas", "William"};
            case "United Arab Emirates" -> new String[]{"Ahmed", "Ali", "Fatima", "Hamad", "Hassan", "Hessa", "Khalid", "Layla", "Mariam", "Mohammed", "Noor", "Omar", "Rashid", "Reem", "Saeed", "Salma", "Salem", "Tariq", "Zayed", "Zainab"};
            default -> new String[]{"Alex", "Chris", "Jordan", "Taylor", "Morgan"};
        };
        return names[random.nextInt(names.length)];
    }

    private String getRandomLastName(String country, Random random) {
        String[] names = switch (country) {
            case "India" -> new String[]{"Agarwal", "Bhatia", "Chopra", "Das", "Deshmukh", "Gupta", "Iyer", "Joshi", "Kapoor", "Kumar", "Malhotra", "Mehta", "Nair", "Patel", "Rao", "Reddy", "Roy", "Saxena", "Sen", "Sharma", "Singh", "Verma"};
            case "USA" -> new String[]{"Anderson", "Brown", "Clark", "Davis", "Evans", "Garcia", "Harris", "Johnson", "Jones", "Miller", "Moore", "Nelson", "Robinson", "Smith", "Taylor", "Thomas", "Walker", "White", "Williams", "Wilson"};
            case "Germany" -> new String[]{"Bauer", "Becker", "Fischer", "Hoffmann", "Koch", "Kraus", "Meyer", "Müller", "Richter", "Schmidt", "Schneider", "Schröder", "Schulz", "Schwarz", "Wagner", "Weber", "Wolf", "Zimmermann"};
            case "United Kingdom" -> new String[]{"Brown", "Clarke", "Davies", "Evans", "Green", "Hall", "Hughes", "Jones", "Lewis", "Morgan", "Roberts", "Smith", "Taylor", "Thomas", "Walker", "Williams", "Wilson", "Wood", "Wright"};
            case "United Arab Emirates" -> new String[]{"Al-Falasi", "Al-Hashemi", "Al-Kaabi", "Al-Maktoum", "Al-Mansoor", "Al-Marzouqi", "Al-Nuaimi", "Al-Otaiba", "Al-Qasimi", "Al-Suwaidi", "Al-Zaabi", "Khan", "Malik", "Siddiqui"};
            default -> new String[]{"Smith", "Jones", "Taylor", "Williams"};
        };
        return names[random.nextInt(names.length)];
    }
}
