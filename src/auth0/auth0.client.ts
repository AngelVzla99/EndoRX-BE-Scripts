import { AuthenticationClient, ManagementClient } from "auth0";
import { ConfigService } from "../config/config.service.js";
import { LoggerClient } from "../clients/logger.client.js";

export interface Auth0User {
    user_id: string;
    email: string;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: any;
}

export class Auth0Client {
    private managementClient: ManagementClient;
    private logger: LoggerClient;
    
    private domain: string;
    private clientId: string;
    private clientSecret: string;
    private audience: string;

    constructor() {
        this.logger = new LoggerClient();
        const configService = new ConfigService();
        const config = configService.getConfig();
        
        this.domain = this.extractDomainFromIssuerBaseUrl(config.auth0.issuerBaseUrl);
        this.clientId = config.auth0.clientId;
        this.clientSecret = config.auth0.clientSecret;
        this.audience = config.auth0.audience;

        const domain = this.extractDomainFromIssuerBaseUrl(config.auth0.issuerBaseUrl);
        
        this.managementClient = new ManagementClient({
            domain,
            clientId: config.auth0.clientId,
            clientSecret: config.auth0.clientSecret,
        });
    }

    private extractDomainFromIssuerBaseUrl(issuerBaseUrl: string): string {
        try {
            const url = new URL(issuerBaseUrl);
            return url.hostname;
        } catch {
            return issuerBaseUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
        }
    }

    async getBearerToken(
        username: string,
        password: string,
    ): Promise<string> {
        const auth0 = new AuthenticationClient({
            domain: this.domain,
            clientId: this.clientId,
            clientSecret: this.clientSecret, // Required for regular web apps
          });

        try {
        const response = await auth0.oauth.passwordGrant({
            username: username,
            password: password,
            // realm: 'Username-Password-Authentication', // The name of your database connection
            audience: this.audience,   // The API you want to access
            scope: 'openid profile email'              // Standard OIDC scopes
        });
        
        return response.data.access_token;
        } catch (err: any) {
            this.logger.error('Error fetching token', { error: err.message });
            throw new Error(err.message);
        }
    }

    async createUser(email: string, password: string){
        this.logger.info("Creating user in Auth0", { email });
        try {
            const user = await this.managementClient.users.create({
                email,
                password,
                connection: "Username-Password-Authentication",
                email_verified: false,
            });
            
            this.logger.info("User created successfully in Auth0", {
                userId: user.user_id,
                email: user.email,
            });
            
            this.logger.info("User created in Auth0", { userId: user.user_id });
            return {
                userId: user.user_id,
                token: await this.getBearerToken(email, password),
            }
        } catch (error) {
            this.logger.error("Failed to create Auth0 user", {
                email,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
}

