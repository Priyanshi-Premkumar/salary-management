package com.acme.compensation.shared.util;

public final class CsvSanitizer {

    private CsvSanitizer() {
        // Utility class
    }

    /**
     * Sanitizes string values to prevent CSV formula injection in spreadsheet applications.
     * If a cell begins with '=', '+', '-', '@', '\t', or '\r', a single quote is prefixed.
     */
    public static String sanitize(Object value) {
        if (value == null) {
            return "";
        }
        String str = value.toString().trim();
        if (str.isEmpty()) {
            return "";
        }
        char firstChar = str.charAt(0);
        if (firstChar == '=' || firstChar == '+' || firstChar == '-' || firstChar == '@' || firstChar == '\t' || firstChar == '\r') {
            return "'" + str;
        }
        return str;
    }
}
