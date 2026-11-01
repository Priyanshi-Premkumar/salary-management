package com.acme.compensation.shared.domain;

import com.acme.compensation.shared.exception.BusinessException;
import java.util.Arrays;

public enum CurrencyCode {
    INR("Indian Rupee", "₹"),
    USD("US Dollar", "$"),
    GBP("British Pound", "£"),
    EUR("Euro", "€"),
    AED("UAE Dirham", "د.إ");

    private final String displayName;
    private final String symbol;

    CurrencyCode(String displayName, String symbol) {
        this.displayName = displayName;
        this.symbol = symbol;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getSymbol() {
        return symbol;
    }

    public static CurrencyCode fromString(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new BusinessException("Currency code cannot be null or empty");
        }
        return Arrays.stream(values())
                .filter(c -> c.name().equalsIgnoreCase(code.trim()))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Unsupported ISO-4217 currency code: " + code + ". Supported: INR, USD, GBP, EUR, AED"));
    }
}
