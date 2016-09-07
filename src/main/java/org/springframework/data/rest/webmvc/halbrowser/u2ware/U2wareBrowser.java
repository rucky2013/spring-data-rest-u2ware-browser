package org.springframework.data.rest.webmvc.halbrowser.u2ware;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.BasePathAwareController;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.View;
import org.springframework.web.servlet.view.RedirectView;

@BasePathAwareController
public class U2wareBrowser {

	public static String BROWSER_INDEX = "/browser/u2ware/index.html";
	
	private final RepositoryRestConfiguration configuration;
	
	@Autowired
	public U2wareBrowser(RepositoryRestConfiguration configuration) {
		Assert.notNull(configuration, "RepositoryRestConfiguration must not be null!");
		this.configuration = configuration;
	}
	
	
	@RequestMapping(value = "/browser/u2ware", method = RequestMethod.GET)
	public View browser() {
		String basePath = configuration.getBasePath().toString();

		String path = "/";
		if(StringUtils.hasText(basePath)){
			path = basePath;
		}
		
		String url = basePath.concat(BROWSER_INDEX).concat("#").concat(path);
		return new RedirectView(url, true);
	}
}
