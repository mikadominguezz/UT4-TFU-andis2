require("dotenv").config();

const cluster = require("cluster");
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { authenticateJWT, authorizeRoles } = require("./middleware/auth");

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;

if (cluster.isMaster || cluster.isPrimary) {
  const workers = parseInt(process.env.WEB_CONCURRENCY) || 2;
  console.log(`🎯 Master PID ${process.pid} iniciando ${workers} workers`);

  for (let i = 0; i < workers; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`⚠️  Worker ${worker.process.pid} terminó. Reiniciando...`);
    cluster.fork();
  });
} else {
  (async () => {
    const { createApp } = require("./src/app");
    const app = await createApp();

    app.use(express.static("public"));

    // Minimal SOAP WSDL y endpoint (sin dependencias externas)
    const WSDL = `<?xml version="1.0" encoding="utf-8"?>
<definitions name="TechMartService"
  targetNamespace="http://example.com/techmart"
  xmlns:tns="http://example.com/techmart"
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/">
  <wsdl:types>
    <xsd:schema targetNamespace="http://example.com/techmart">
      <xsd:element name="getServicesHealthRequest">
        <xsd:complexType>
          <xsd:sequence/>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="getServicesHealthResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="adminStatus" type="xsd:string"/>
            <xsd:element name="clientStatus" type="xsd:string"/>
            <xsd:element name="productsStatus" type="xsd:string"/>
            <xsd:element name="ordersStatus" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </wsdl:types>
  <wsdl:message name="getServicesHealthInput">
    <wsdl:part name="parameters" element="tns:getServicesHealthRequest"/>
  </wsdl:message>
  <wsdl:message name="getServicesHealthOutput">
    <wsdl:part name="parameters" element="tns:getServicesHealthResponse"/>
  </wsdl:message>
  <wsdl:portType name="TechMartPortType">
    <wsdl:operation name="getServicesHealth">
      <wsdl:input message="tns:getServicesHealthInput"/>
      <wsdl:output message="tns:getServicesHealthOutput"/>
    </wsdl:operation>
  </wsdl:portType>
  <wsdl:binding name="TechMartBinding" type="tns:TechMartPortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <wsdl:operation name="getServicesHealth">
      <soap:operation soapAction="http://example.com/techmart/getServicesHealth"/>
      <wsdl:input>
        <soap:body use="literal"/>
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal"/>
      </wsdl:output>
    </wsdl:operation>
  </wsdl:binding>
  <wsdl:service name="TechMartService">
    <wsdl:port name="TechMartPort" binding="tns:TechMartBinding">
      <soap:address location="REPLACE_WITH_RUNTIME_URL"/>
    </wsdl:port>
  </wsdl:service>
</definitions>`;

    // Serve WSDL
    const serveWsdl = (req, res) => {
      const host = req.get("host");
      const proto = req.protocol;
      const wsdlWithAddress = WSDL.replace(
        "REPLACE_WITH_RUNTIME_URL",
        `${proto}://${host}/soap`
      );
      res.set("Content-Type", "text/xml; charset=utf-8");
      res.send(wsdlWithAddress);
    };
    app.get("/wsdl", serveWsdl);
    app.post("/wsdl", serveWsdl);
    // Common SOAP discovery pattern: /soap?wsdl returns the WSDL
    app.get("/soap", (req, res) => {
      if (typeof req.query.wsdl !== "undefined") {
        return serveWsdl(req, res);
      }
      res.status(405).send("Method Not Allowed");
    });

    // SOAP endpoint: getServicesHealth operation
    app.use(
      "/soap",
      bodyParser.text({ type: ["text/xml", "application/soap+xml", "application/xml", "*/xml"] })
    );
    app.post("/soap", async (req, res) => {
      const xml = req.body || "";
      const isHealthRequest = /<\s*getServicesHealthRequest[\s>]/i.test(xml);
      if (!isHealthRequest) {
        res.status(400).set("Content-Type", "text/xml; charset=utf-8").send(`<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Client</faultcode>
      <faultstring>Unsupported operation. Use getServicesHealth.</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`);
        return;
      }

      const targets = [
        { key: "adminStatus", url: "http://admin-api:3001/admin/health" },
        { key: "clientStatus", url: "http://client-api:3002/clients/health" },
        { key: "productsStatus", url: "http://products-api:3003/health" },
        { key: "ordersStatus", url: "http://orders-api:3004/health" },
      ];

      const results = {};
      await Promise.all(
        targets.map(async (t) => {
          try {
            const r = await axios.get(t.url, { timeout: 2000 });
            results[t.key] = r.status === 200 ? "UP" : "DOWN";
          } catch (_) {
            results[t.key] = "DOWN";
          }
        })
      );

      const soapResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <getServicesHealthResponse xmlns="http://example.com/techmart">
      <adminStatus>${results.adminStatus || "DOWN"}</adminStatus>
      <clientStatus>${results.clientStatus || "DOWN"}</clientStatus>
      <productsStatus>${results.productsStatus || "DOWN"}</productsStatus>
      <ordersStatus>${results.ordersStatus || "DOWN"}</ordersStatus>
    </getServicesHealthResponse>
  </soap:Body>
</soap:Envelope>`;

      res.set("Content-Type", "text/xml; charset=utf-8");
      res.send(soapResponse);
    });

    app.post("/login", (req, res) => {
      const { username, password } = req.body;

      const users = [
        { username: "alice", password: "alicepass", roles: ["user"] },
        { username: "bob", password: "bobpass", roles: ["admin"] },
      ];

      const user = users.find(
        (u) => u.username === username && u.password === password,
      );

      if (!user) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      const token = jwt.sign(
        {
          username: user.username,
          roles: user.roles,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );
      res.status(200).json({ token });
    });

    // No more direct controller imports - everything goes through HTTP to microservices

    const server = app.listen(PORT, () => {
      console.log(`✅ Worker PID ${process.pid} escuchando en puerto ${PORT}`);
    });

    process.on("SIGTERM", () => {
      console.log(`🔄 Worker ${process.pid} recibió SIGTERM, cerrando...`);
      server.close(() => {
        process.exit(0);
      });
    });
  })().catch(console.error);
}
