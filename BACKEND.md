# SimpleClaw Backend Documentation

## Overview

The SimpleClaw backend provides managed Telegram bot hosting with the following features:

- **Prisma + SQLite** database for bot storage and deployments
- **Clerk authentication** for user management
- **REST API** for bot CRUD and deployment operations
- **Telegram webhook handling** for live bot interactions

## Database Schema

### Bot Model
| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Unique identifier |
| userId | String | Clerk user ID |
| name | String | Bot display name |
| username | String? | Telegram bot username |
| token | String | Telegram bot token |
| status | String | PENDING/DEPLOYING/LIVE/ERROR/STOPPED |
| webhookUrl | String? | Active webhook URL |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| deployments | Deployment[] | Related deployments |

### Deployment Model
| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Unique identifier |
| botId | String | Related bot ID |
| status | String | PENDING/IN_PROGRESS/SUCCESS/FAILED |
| logs | String? | Deployment logs |
| error | String? | Error message if failed |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

## API Routes

### `/api/bots` - Bot Management

#### GET
Returns all bots for the authenticated user.

**Response:**
```json
{
  "bots": [{
    "id": "...",
    "name": "My Bot",
    "username": "mybot_bot",
    "token": "123456789:ABC...",
    "status": "LIVE",
    "deployments": [...]
  }]
}
```

#### POST
Creates a new bot. Validates the Telegram token with the Telegram API.

**Body:**
```json
{
  "token": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
}
```

**Response:**
```json
{
  "bot": {
    "id": "...",
    "name": "My Bot",
    "username": "mybot_bot",
    "status": "PENDING"
  }
}
```

#### PATCH
Updates bot status and webhook URL.

**Body:**
```json
{
  "id": "bot-id",
  "status": "LIVE",
  "webhookUrl": "https://..."
}
```

#### DELETE
Removes a bot and deletes its Telegram webhook.

**Query Param:** `id=bot-id`

### `/api/deploy` - Deployment Control

#### POST
Deploys a bot by setting up Telegram webhook.

**Body:**
```json
{
  "botId": "bot-id"
}
```

**Response:**
```json
{
  "success": true,
  "deployment": {
    "id": "...",
    "status": "SUCCESS",
    "logs": "Webhook set successfully",
    "webhookUrl": "https://..."
  }
}
```

#### DELETE
Stops a bot by deleting its Telegram webhook.

**Query Param:** `botId=bot-id`

### `/api/webhook/telegram/[botId]` - Telegram Webhooks

Telegram sends updates here. The bot handles:

- `/start` - Welcome message
- `/help` - Command list
- `/status` - Bot status check
- `/echo <text>` - Echo response
- Messages - Echo with friendly response
- Callback queries - Acknowledgment
- Inline queries - Basic responses

## Bot Lifecycle

1. **Create**: User pastes token → validated with Telegram → stored with PENDING status
2. **Deploy**: Webhook set on Telegram → bot goes LIVE
3. **Live**: Telegram sends updates to webhook endpoint
4. **Stop**: Webhook deleted → bot goes STOPPED
5. **Redeploy**: Webhook re-set → bot goes LIVE again
6. **Delete**: Webhook deleted → bot removed from database

## Testing

### Local Development
1. Set up environment variables in `.env.local`
2. Run `npm run db:migrate` to set up database
3. Run `npm run dev` to start dev server
4. Use ngrok or similar for Telegram webhooks:
   ```bash
   ngrok http 3456
   ```
5. Update `NEXT_PUBLIC_APP_URL` to your tunnel URL

### Testing with a Real Telegram Bot
1. Message @BotFather on Telegram
2. Create a new bot and get the token
3. In SimpleClaw dashboard, click "Deploy New Bot"
4. Paste your token and deploy
5. Message your bot - it will respond!

## What's Still Needed

### Stripe Integration
- Subscription management
- Usage-based billing
- Payment webhooks

### Production Deployment
- PostgreSQL instead of SQLite
- Redis for caching/sessions
- Proper token encryption (not just stored in DB)
- Rate limiting on API routes

### Bot Features
- Custom bot personalities/prompts
- Webhook secret verification
- Bot analytics dashboard
- Custom commands configuration

### Infrastructure
- Docker containerization
- CI/CD pipeline
- Automated backups
- Monitoring/alerting
