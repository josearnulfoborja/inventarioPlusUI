import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'inventarioplus_token';
const USER_KEY = 'inventarioplus_user';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly loginUrl = `${environment.apiUrl.replace(/\/$/, '')}/auth/login`;

    constructor(private readonly http: HttpClient, private readonly router: Router) {}

    /**
     * Call backend login. The backend may return an object { token: string } or similar.
     */
    login(username: string, password: string): Observable<void> {
        return this.http.post<any>(this.loginUrl, { username, password }).pipe(
            map((resp) => {
                console.log('Login response:', resp);
                
                // Try common shapes
                let token: string | undefined;
                let userData: any = null;
                
                if (!resp) return;
                if (typeof resp === 'string') token = resp;
                else if (resp.token) token = resp.token;
                else if (resp.accessToken) token = resp.accessToken;
                else if (resp.data && (resp.data.token || resp.data.accessToken)) token = resp.data.token ?? resp.data.accessToken;

                if (!token) throw new Error('No token returned from login');

                console.log('Token found:', token);
                localStorage.setItem(TOKEN_KEY, token);
                
                // Store user data - check multiple possible locations
                if (resp.user) {
                    userData = resp.user;
                } else if (resp.data?.user) {
                    userData = resp.data.user;
                } else if (resp.idUsuario || resp.nombre || resp.username) {
                    // User data is directly in response
                    userData = resp;
                }
                
                console.log('User data to store:', userData);
                
                // Si no hay userData en la respuesta, crear uno básico desde el JWT
                if (!userData) {
                    try {
                        const payload = this.decodeToken(token);
                        console.log('JWT payload:', payload);
                        
                        if (payload?.sub) {
                            // Crear objeto de usuario básico con el username del JWT
                            userData = {
                                username: payload.sub,
                                nombre: payload.sub, // Usar username como nombre temporal
                                rol: 'Usuario' // Rol por defecto
                            };
                            console.log('Created basic user data from JWT:', userData);
                        }
                    } catch (e) {
                        console.error('Error decoding JWT:', e);
                    }
                }
                
                if (userData) {
                    localStorage.setItem(USER_KEY, JSON.stringify(userData));
                    console.log('User data saved to localStorage');
                }
            })
        );
    }

    private decodeToken(token: string): any {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload;
    }

    /**
     * Clear local token and optionally redirect to login.
     * If replaceUrl is true the navigation replaces history entry (prevents back-button returning to protected routes).
     */
    clearLocalToken(redirect: boolean = true, replaceUrl: boolean = false) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    if (redirect) this.router.navigate(['/auth/login2'], { replaceUrl });
    }

    /**
     * Logout locally. Does NOT call server revocation.
     */
    logout(redirect: boolean = true) {
        this.clearLocalToken(redirect);
    }

    /**
     * Attempt server-side logout/revocation. If the backend exposes POST /auth/logout this will call it.
     * The caller may subscribe and then clear local token or handle errors.
     */
    logoutServer() {
        const logoutUrl = `${environment.apiUrl.replace(/\/$/, '')}/auth/logout`;
        return this.http.post<any>(logoutUrl, {});
    }

    /**
     * Revoke token on server (if endpoint exists) and always clear local token.
     * This method ensures we send the token explicitly in the Authorization header
     * so clearing localStorage before the request does not prevent the header from being sent.
     */
    revokeTokenAndClear(): Observable<void> {
        const token = this.getToken();
        const logoutUrl = `${environment.apiUrl.replace(/\/$/, '')}/auth/logout`;

        if (!token) {
            // no token: just clear local and navigate
            this.clearLocalToken(true, true);
            return of(void 0);
        }

        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

        // Clear local token immediately so the UI state updates and back-button can't return
        // (we still send the token variable in the Authorization header to attempt server revocation)
        this.clearLocalToken(false, true);

        return this.http.post<any>(logoutUrl, {}, { headers }).pipe(
            map(() => void 0),
            catchError((err) => {
                // swallow errors but already cleared local token
                return of(void 0);
            })
        );
    }

    /**
     * Check token expiry if token is a JWT. Returns true when expired or no token exists.
     */
    isTokenExpired(): boolean {
        const token = this.getToken();
        if (!token) return true;
        const parts = token.split('.');
        if (parts.length !== 3) return false; // non-JWT, assume valid
        try {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (!payload || !payload.exp) return false;
            const now = Math.floor(Date.now() / 1000);
            return payload.exp <= now;
        } catch (e) {
            return false; // if parsing fails, assume not expired
        }
    }

    /**
     * Returns true if a token exists and is not expired (when JWT). Use for route guarding.
     */
    isAuthenticatedAndValid(): boolean {
        const token = this.getToken();
        if (!token) return false;
        return !this.isTokenExpired();
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    getUser(): Record<string, any> | null {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
