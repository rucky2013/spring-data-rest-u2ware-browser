package org.springframework.data.rest.webmvc.halbrowser.u2ware;


import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestMvcConfiguration;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import static org.hamcrest.CoreMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration
public class U2wareBrowserTests {

	protected Log logger = LogFactory.getLog(getClass());

	static final String BASE_PATH = "/api";
	static final String BROWSER_INDEX = "/browser/u2ware/index.html";
	static final String TARGET = BASE_PATH.concat(BROWSER_INDEX).concat("#").concat(BASE_PATH);

	@Configuration
	@EnableWebMvc
	static class TestConfiguration extends RepositoryRestMvcConfiguration {

		@Override
		protected void configureRepositoryRestConfiguration(RepositoryRestConfiguration config) {
			config.setBasePath(BASE_PATH);
		}
	}

	private @Autowired WebApplicationContext context;
	private MockMvc mvc;

	@Before
	public void setUp() {
		this.mvc = MockMvcBuilders.webAppContextSetup(context).build();
	}
	
	@Test
	public void exposesJsonUnderApiRootByDefault() throws Exception {

		mvc.perform(get(BASE_PATH).accept(MediaType.ALL)).//
				andDo(print()).
				andExpect(status().isOk()).//
				andExpect(header().string(HttpHeaders.CONTENT_TYPE, startsWith(MediaTypes.HAL_JSON.toString())));
	}
	
	@Test
	public void exposesHalBrowser() throws Exception {

		mvc.perform(get(BASE_PATH.concat("/browser/u2ware/index.html"))).//
				andDo(print()).
				andExpect(status().isOk()).//
				andExpect(content().string(containsString("REST: ")));
	}

	@Test
	public void forwardsBrowserToIndexHtml() throws Exception {

		mvc.perform(get(BASE_PATH.concat("/browser/u2ware"))).//
				andDo(print()).
				andExpect(status().isFound()).//
				andExpect(header().string(HttpHeaders.LOCATION, endsWith(TARGET)));
	}	
	

	
	
	
}