package org.apache.calcite.avatica.js;

import org.apache.calcite.avatica.server.AvaticaJsonHandler;
import org.apache.calcite.avatica.server.HttpServer;
import org.apache.calcite.avatica.server.Main;

import java.net.InetAddress;

import static org.apache.calcite.avatica.js.ServerUtil.initJavaLogging;
import static org.apache.calcite.avatica.js.ServerUtil.intellijPrint;

public class AvaticaJsMain {
    public static int port = 8080;

    public static void main(String[] args) throws Exception {
        try {
            initJavaLogging();
            HttpServer server = Main.start(new String[]{SQLiteMetaFactory.class.getName()}, port, AvaticaJsonHandler::new);
            InetAddress address = InetAddress.getLocalHost();
            String hostName = "localhost";
            if (address != null) {
                hostName = address.getHostName() != null && !address.getHostName().isBlank() ? address.getHostName() : address
                   .getHostAddress();
            }
            String url = "http://" + hostName + ":" + server.getPort();
            System.out.println("Server started, Please connect : " + url);
            server.join();
        } catch (Exception e) {
            intellijPrint(e);
        }
    }

}
