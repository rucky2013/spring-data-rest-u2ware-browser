# spring-data-rest-u2ware-browser

**U2ware Browser** 는 
[Spring Data Rest](http://docs.spring.io/spring-data/rest/docs/current/reference/html/) 로 구성한 hal+json 미디어 타잎의 API 
를 사용하는 UI 브라우저 입니다. [Hal Browser](http://docs.spring.io/spring-data/rest/docs/current/reference/html/#_the_hal_browser)와 
동일한 컨셉이며, [AngulaJs](https://www.angularjs.org/)를 사용하여 개발 되었습니다. 아래와 같이 Maven Dependency 를 통해 얻을 수 있습니다.


```xml
    <repositories>
        <repository>
            <id>u2ware-mvm-repo</id>
            <url>https://raw.github.com/u2ware/u2ware.github.com/mvn-repo/</url>
        </repository>
    </repositories>
    
    <dependencies>
        <dependency>
            <groupId>io.github.u2ware</groupId>
            <artifactId>spring-data-rest-u2ware-browser</artifactId>
            <version>1.0.0</version>
        </dependency>
    </dependencies>
```
 

**U2ware Browser** Dependency 가  추가된  [Spring Data Rest](http://docs.spring.io/spring-data/rest/docs/current/reference/html/) 애플리케이션이 시작 될 때, 
자동으로 설정 되고, ```http://[application’s root URI]/browser/u2ware``` 경로로 브라우저에서 접근 할 수 있습니다. 


[U2ware Browser Demo](https://github.com/u2ware/spring-data-rest-u2ware-browser-demo) 
![image](https://raw.githubusercontent.com/u2ware/spring-data-rest-u2ware-browser-demo/master/src/main/resources/static/20160511_093702.png)
![image](https://raw.githubusercontent.com/u2ware/spring-data-rest-u2ware-browser-demo/master/src/main/resources/static/20160511_093716.png)
![image](https://raw.githubusercontent.com/u2ware/spring-data-rest-u2ware-browser-demo/master/src/main/resources/static/20160511_093732.png)
