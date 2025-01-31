// package com.rits.fentapco.util;

// import org.springframework.beans.BeansException;
// import org.springframework.context.ApplicationContext;
// import org.springframework.context.ApplicationContextAware;
// import org.springframework.stereotype.Component;

// @Component
// public class ApplicationContextProvider implements ApplicationContextAware {
//     private static ApplicationContext context;

//     @Override
//     public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
//         context = applicationContext;
//     }

//     public static ApplicationContext getApplicationContext() {
//         return context;
//     }
// }
package com.rits.fentapco.util;

import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class ApplicationContextProvider {

    private static ApplicationContext applicationContext;

    public static ApplicationContext getApplicationContext() {
        return applicationContext;
    }

    public ApplicationContextProvider(ApplicationContext applicationContext) {
        ApplicationContextProvider.applicationContext = applicationContext;
    }
}
