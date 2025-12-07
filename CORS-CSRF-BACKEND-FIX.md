# Backend Fix - CORS and CSRF for PUT/POST/DELETE Operations

## Problem
PUT requests to `/api/equipos/{id}` return **403 Forbidden** even when credentials are sent correctly.

This typically indicates one of two issues:
1. **CORS configuration** doesn't allow credentials or the specific origin
2. **CSRF protection** is enabled and the request lacks the CSRF token

## Symptoms from DevTools
```
Request URL: http://localhost:8080/api/equipos/26
Request Method: PUT
Status Code: 403 Forbidden
Referer Policy: strict-origin-when-cross-origin
```

## Root Causes

### 1. CORS Not Configured for Credentials
If Spring Security or your CORS filter doesn't explicitly allow:
- `Access-Control-Allow-Credentials: true`
- The specific origin (e.g., `http://localhost:4200`)

Then requests with `withCredentials: true` will fail.

### 2. CSRF Protection Active Without Token
By default, Spring Security enables CSRF protection for:
- POST, PUT, PATCH, DELETE (state-changing methods)
- But NOT for GET, HEAD, OPTIONS

When using session-based auth (cookies), the backend expects:
- A `X-XSRF-TOKEN` header (or `_csrf` parameter)
- Matching the value in the `XSRF-TOKEN` cookie

## Solutions

### Option 1: Fix CORS + Keep CSRF (Recommended for Production)

**Step 1: Configure CORS to allow credentials**

```java
// WebConfig.java or SecurityConfig.java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")  // Your Angular dev server
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)  // CRITICAL: Enable credentials
                .maxAge(3600);
    }
}
```

**Step 2: Configure CSRF to work with Angular**

```java
// SecurityConfig.java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors() // Enable CORS with the config above
            .and()
            .csrf()
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                // This creates a cookie named XSRF-TOKEN that JavaScript can read
            .and()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll()  // or authenticated()
                .anyRequest().authenticated()
            );
        
        return http.build();
    }
}
```

**Step 3: Angular HttpClient automatically reads `XSRF-TOKEN` cookie**

Angular's HttpClient will:
1. Read the `XSRF-TOKEN` cookie
2. Send it as the `X-XSRF-TOKEN` header on PUT/POST/DELETE requests

No additional frontend code needed if using `HttpClient` (which you are).

**Step 4: Verify cookies are being set**

After login, check in DevTools → Application → Cookies that you see:
- `JSESSIONID` (session cookie)
- `XSRF-TOKEN` (CSRF token cookie)

Both should be set for `localhost:8080`.

---

### Option 2: Disable CSRF (Only for Development/Testing)

**WARNING**: Only use this for local development. NEVER in production.

```java
// SecurityConfig.java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors()
        .and()
        .csrf().disable()  // Disable CSRF protection
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/**").permitAll()
            .anyRequest().authenticated()
        );
    
    return http.build();
}
```

---

### Option 3: Use JWT Instead of Sessions (Alternative Architecture)

If you want to avoid session cookies and CSRF entirely:

1. Backend returns a JWT token on login
2. Frontend stores it in localStorage
3. Frontend sends it in `Authorization: Bearer <token>` header
4. Backend validates the JWT on each request

With JWT, you don't need:
- Session cookies
- CSRF tokens
- `withCredentials: true`

Your frontend already sends `Authorization: Bearer ...` if a token exists (see `ApiService.buildHttpOptions`).

---

## Testing the Fix

### After applying CORS + CSRF fix:

1. **Login** to get a session cookie (`JSESSIONID`) and CSRF token (`XSRF-TOKEN`)

2. **Check cookies** in DevTools → Application → Cookies:
   ```
   Name: JSESSIONID
   Value: <some-hex-string>
   Domain: localhost
   Path: /
   
   Name: XSRF-TOKEN
   Value: <some-uuid>
   Domain: localhost
   Path: /
   HttpOnly: NO  (important - must be readable by JS)
   ```

3. **Try to update an equipo** via PUT:
   - Open DevTools → Network
   - Edit and save an equipo
   - Check the PUT request headers:
     ```
     Cookie: JSESSIONID=...; XSRF-TOKEN=...
     X-XSRF-TOKEN: <same-value-as-cookie>
     ```

4. **Expected result**: 
   - Status: 200 OK (not 403)
   - Response body contains the updated equipo

### If still failing with 403:

1. **Check backend logs** for:
   - `InvalidCsrfTokenException` → CSRF token mismatch
   - `Access Denied` → authorization/permissions issue
   - CORS errors → origin not allowed

2. **Verify CORS headers** in response:
   ```
   Access-Control-Allow-Origin: http://localhost:4200
   Access-Control-Allow-Credentials: true
   ```

3. **Test with curl** (bypassing browser CORS):
   ```bash
   # Get CSRF token first
   curl -i -X GET http://localhost:8080/api/equipos \
     -H "Cookie: JSESSIONID=your-session-id" \
     -c cookies.txt

   # Use the XSRF-TOKEN from cookies.txt
   curl -i -X PUT http://localhost:8080/api/equipos/26 \
     -H "Content-Type: application/json" \
     -H "Cookie: JSESSIONID=your-session-id; XSRF-TOKEN=your-csrf-token" \
     -H "X-XSRF-TOKEN: your-csrf-token" \
     -d '{"nombre":"Test","tipo_id":3,"marca_id":5,...}'
   ```

---

## Quick Comparison: Session vs JWT

| Aspect | Session + CSRF | JWT |
|--------|----------------|-----|
| Auth storage | Server-side session | Client-side token |
| CSRF risk | Yes (needs protection) | No (stateless) |
| CORS credentials | Required (`withCredentials: true`) | Not needed |
| Scalability | Requires sticky sessions | Fully stateless |
| Frontend complexity | Automatic (HttpClient handles CSRF) | Manual (store + send token) |
| Security | Session hijacking risk | Token theft risk |

---

## Recommended Configuration (Spring Boot 3.x)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS with credentials
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // CSRF with cookie-based token for Angular
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            )
            
            // Authorization rules
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
            )
            
            // Session management
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            );
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
```

---

## Summary

1. **Enable CORS with credentials** in backend config
2. **Use `CookieCsrfTokenRepository.withHttpOnlyFalse()`** so Angular can read the token
3. **Ensure cookies are being set** after login (check DevTools)
4. **Angular HttpClient will automatically** send the `X-XSRF-TOKEN` header

After these changes, PUT/POST/DELETE requests should succeed with 200 OK instead of 403 Forbidden.

If you're already using JWT (not session cookies), remove `withCredentials: true` and ensure the `Authorization` header is being sent instead.
