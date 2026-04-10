package com.cherryskincare.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.Arrays;
import java.util.Locale;

/**
 * Configuración para internacionalización (i18n) y catálogo de mensajes.
 * Permite centralizar mensajes de error y facilitar la localización.
 */
@Configuration
public class MessageSourceConfig {

    /**
     * Configura el MessageSource para cargar mensajes desde archivos properties.
     * Los mensajes se cargan desde messages.properties y messages_{locale}.properties
     */
    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:messages");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setCacheSeconds(3600); // Cache por 1 hora
        messageSource.setFallbackToSystemLocale(true);
        return messageSource;
    }

    /**
     * Configura el resolver de locale basado en el header Accept-Language.
     * Soporta español (es) e inglés (en), con español como predeterminado.
     */
    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver localeResolver = new AcceptHeaderLocaleResolver();
        localeResolver.setSupportedLocales(Arrays.asList(
            new Locale("es"), // Español
            new Locale("en")  // Inglés
        ));
        localeResolver.setDefaultLocale(new Locale("es")); // Español por defecto
        return localeResolver;
    }
}
