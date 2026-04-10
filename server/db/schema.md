# Database schema (SQLite)

## Jadvalar

### users
| Ustun | Tur | Tavsif |
|-------|-----|--------|
| id | INTEGER PK | |
| telegram_id | INTEGER UNIQUE | Telegram user id |
| phone | TEXT | |
| first_name | TEXT | |
| last_name | TEXT | |
| username | TEXT | |
| photo_url | TEXT | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### user_profiles
| Ustun | Tur |
|-------|-----|
| id | INTEGER PK |
| user_id | INTEGER FK(users) UNIQUE |
| height | INTEGER |
| weight | INTEGER |
| gender | TEXT |
| body_type | TEXT |
| default_event | TEXT |
| budget | TEXT |
| style_preferences | TEXT |
| created_at | DATETIME |
| updated_at | DATETIME |

### styles
| Ustun | Tur |
|-------|-----|
| id | INTEGER PK |
| key | TEXT UNIQUE |
| name_en | TEXT |
| name_ru | TEXT |
| name_uz | TEXT |
| image_url | TEXT |
| description | TEXT |
| created_at | DATETIME |

### saved_outfits
| Ustun | Tur |
|-------|-----|
| id | INTEGER PK |
| user_id | INTEGER FK(users) |
| occasion | TEXT |
| image_url | TEXT |
| outfit_json | TEXT |
| persona_summary | TEXT |
| shopping_json | TEXT |
| created_at | DATETIME |

### admin_users
| Ustun | Tur |
|-------|-----|
| id | INTEGER PK |
| login | TEXT UNIQUE |
| password_hash | TEXT |
| created_at | DATETIME |

### subscriptions
| Ustun | Tur |
|-------|-----|
| id | INTEGER PK |
| user_id | INTEGER FK(users) UNIQUE |
| plan | TEXT |
| started_at | DATETIME |
| expires_at | DATETIME |
| created_at | DATETIME |

### ai_requests
| Ustun | Tur |
|-------|-----|
| id | INTEGER PK |
| user_id | INTEGER FK(users) |
| occasion | TEXT |
| response_preview | TEXT |
| created_at | DATETIME |

## API → DB

- **GET /api/styles** → styles (client va admin bir xil format)
- **GET /api/admin/styles** → styles
- **POST/PUT /api/admin/styles** → styles
- **Admin o'zgartirsa** → DB yangilanadi → **Client /api/styles** orqali yangi ma'lumot oladi
