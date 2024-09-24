package org.apache.calcite.avatica.js;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.Driver;
import java.sql.DriverManager;
import java.util.Enumeration;

public interface ServerUtil {
    static void intellijPrint(Exception exception) {
        StringWriter sw = new StringWriter();
        PrintWriter pr = new PrintWriter(sw);
        exception.printStackTrace(pr);
        String stackTrace = sw.toString();
        System.err.println(exception.getMessage());
        for (String line : stackTrace.split("\n")) {
            System.err.println("- " + line);
        }
    }

    static void initJavaLogging() {
        System.setProperty("org.slf4j.simpleLogger.defaultLogLevel", "debug");
        System.setProperty("org.slf4j.simpleLogger.log.org.eclipse.jetty", "info");
        System.setProperty("org.slf4j.simpleLogger.log.org.apache.calcite.avatica", "debug");
    }

    static void printProperties() {
        System.getProperties().entrySet().forEach(System.out::println);
    }

    static void printDatabaseDrivers() {
        Enumeration<Driver> drivers = DriverManager.getDrivers();
        while (drivers.hasMoreElements()) {
            System.out.println(drivers.nextElement().getClass());
        }
    }
}
