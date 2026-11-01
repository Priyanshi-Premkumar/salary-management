package com.acme.compensation.shared.domain;

import static org.junit.jupiter.api.Assertions.*;

import com.acme.compensation.shared.exception.ValidationException;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MoneyTest {

    @Test
    @DisplayName("Should successfully create Money with scale of 4")
    void shouldCreateMoneyWithCorrectScale() {
        Money money = Money.of(new BigDecimal("1500.5"), CurrencyCode.USD);
        assertEquals(new BigDecimal("1500.5000"), money.amount());
        assertEquals(CurrencyCode.USD, money.currency());
        assertTrue(money.isPositive());
        assertTrue(money.isNonNegative());
    }

    @Test
    @DisplayName("Should add money with the same currency")
    void shouldAddMoneyWithSameCurrency() {
        Money m1 = Money.of(new BigDecimal("1000.00"), CurrencyCode.INR);
        Money m2 = Money.of(new BigDecimal("250.50"), CurrencyCode.INR);
        Money result = m1.add(m2);

        assertEquals(new BigDecimal("1250.5000"), result.amount());
        assertEquals(CurrencyCode.INR, result.currency());
    }

    @Test
    @DisplayName("Should throw exception when attempting direct cross-currency math")
    void shouldRejectCrossCurrencyArithmetic() {
        Money inr = Money.of(new BigDecimal("1000.00"), CurrencyCode.INR);
        Money usd = Money.of(new BigDecimal("50.00"), CurrencyCode.USD);

        ValidationException ex = assertThrows(ValidationException.class, () -> inr.add(usd));
        assertTrue(ex.getMessage().contains("Direct currency aggregation prohibited"));
    }

    @Test
    @DisplayName("Should validate CurrencyCode lookup")
    void shouldLookupCurrencyCodeSafely() {
        assertEquals(CurrencyCode.EUR, CurrencyCode.fromString("EUR"));
        assertEquals(CurrencyCode.GBP, CurrencyCode.fromString("gbp"));
        assertEquals(CurrencyCode.AED, CurrencyCode.fromString("AED"));
    }
}
