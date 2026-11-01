package com.acme.compensation.shared.domain;

import com.acme.compensation.shared.exception.ValidationException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

public record Money(BigDecimal amount, CurrencyCode currency) {

    public Money {
        Objects.requireNonNull(currency, "Currency must not be null");
        if (amount == null) {
            throw new ValidationException("Monetary amount must not be null");
        }
        amount = amount.setScale(4, RoundingMode.HALF_UP);
    }

    public static Money of(BigDecimal amount, CurrencyCode currency) {
        return new Money(amount, currency);
    }

    public static Money of(BigDecimal amount, String currencyCode) {
        return new Money(amount, CurrencyCode.fromString(currencyCode));
    }

    public static Money zero(CurrencyCode currency) {
        return new Money(BigDecimal.ZERO, currency);
    }

    public Money add(Money other) {
        validateSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money subtract(Money other) {
        validateSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }

    public boolean isPositive() {
        return amount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isNonNegative() {
        return amount.compareTo(BigDecimal.ZERO) >= 0;
    }

    private void validateSameCurrency(Money other) {
        if (this.currency != other.currency) {
            throw new ValidationException(String.format(
                    "Direct currency aggregation prohibited without explicit conversion: cannot combine %s and %s",
                    this.currency, other.currency));
        }
    }
}
