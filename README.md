1. Open Eclipse

Then:

File → Import

2. Select:

Maven → Existing Maven Projects

→ Next

3. Browse to the HMS folder you cloned

Select:

SE-Practice
   └── HMS   ← select THIS folder

Eclipse should automatically detect:

pom.xml

4. Tick the pom.xml project → Finish

Wait for Eclipse to finish importing/dependency downloading.

Then in Eclipse

On the left in Project Explorer, you should see the HMS project.

Expand it:

HMS
├── src
├── target       (may appear after build)
├── pom.xml      ← IMPORTANT
└── ...
Now Maven build

Right-click HMS project → Run As → Maven clean

Then:

Right-click HMS → Run As → Maven install

Or, if Eclipse gives you Maven build..., you can enter:

clean install

The goal is:

BUILD SUCCESS





=========================================================================================================

<?xml version="1.0" encoding="UTF-8"?>

<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">

    <!-- Basic project information -->
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.apartment</groupId>
    <artifactId>ApartmentManagementSystem</artifactId>
    <version>1.0-SNAPSHOT</version>

    <!-- Web application -->
    <packaging>war</packaging>


    <!-- ================= DEPENDENCIES ================= -->

    <dependencies>

        <!-- Servlet API -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>4.0.1</version>
            <scope>provided</scope>
        </dependency>

        <!-- MySQL JDBC Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>8.0.33</version>
        </dependency>

        <!-- JUnit -->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>

    </dependencies>


    <!-- ================= BUILD ================= -->

    <build>

        <!-- Name of generated WAR -->
        <finalName>ApartmentMaintenanceSystem</finalName>


        <!-- ================= PLUGIN MANAGEMENT ================= -->

        <pluginManagement>

            <plugins>

                <plugin>
                    <groupId>org.apache.tomcat.maven</groupId>
                    <artifactId>tomcat7-maven-plugin</artifactId>
                    <version>2.2</version>
                </plugin>

            </plugins>

        </pluginManagement>


        <!-- ================= ACTIVE PLUGINS ================= -->

        <plugins>

            <!-- Tomcat plugin -->
            <plugin>
                <groupId>org.apache.tomcat.maven</groupId>
                <artifactId>tomcat7-maven-plugin</artifactId>
                <version>2.2</version>

                <configuration>
                    <path>/</path>
                    <port>8080</port>
                </configuration>

            </plugin>

        </plugins>

    </build>

</project>



===============================================================================================

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/apartment-management.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]

===============================================================================================
git clone https://github.com/sarasrija/ApartmentManagementSystem.git
cd ApartmentManagementSystem
dir

docker build -t apartmentapp-image .

docker run -d --name apartment-app-container -p 8080:8080 apartmentapp-image

docker ps
docker ps -a

docker exec -it apartment-app-container /bin/sh

docker stop apartment-app-container
docker start apartment-app-container

docker commit <container-id> <your_dockerhub_username>/apartmentapp:v1

docker login

docker push <your_dockerhub_username>/apartmentapp:v1

docker logout
