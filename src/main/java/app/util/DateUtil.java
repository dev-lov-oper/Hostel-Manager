package app.util;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class DateUtil {

    private static final String DEFAULT_DATE_PATTERN = "yyyy-MM-dd HH:mm:ss";
    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern(DEFAULT_DATE_PATTERN);

    /**
     * Returns current time as java.sql.Timestamp for database records.
     */
    public static Timestamp nowTimestamp() {
        return new Timestamp(System.currentTimeMillis());
    }

    /**
     * Formats a Timestamp object into a readable date-time string.
     */
    public static String formatTimestamp(Timestamp timestamp) {
        if (timestamp == null) return "N/A";
        SimpleDateFormat sdf = new SimpleDateFormat(DEFAULT_DATE_PATTERN);
        return sdf.format(new Date(timestamp.getTime()));
    }

    /**
     * Formats current date-time into a readable string.
     */
    public static String formatCurrentDateTime() {
        return LocalDateTime.now().format(DEFAULT_FORMATTER);
    }

    /**
     * Calculates the difference in days between two Timestamps.
     */
    public static long getDaysBetween(Timestamp start, Timestamp end) {
        if (start == null || end == null) return 0;
        long diffMs = end.getTime() - start.getTime();
        return diffMs / (1000 * 60 * 60 * 24);
    }
}