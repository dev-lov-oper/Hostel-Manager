# HostelHub — Smart Hostel & Room Allocation Management System

> **A modern, architectural SaaS hostel space allocation and complaint lifecycle management platform demonstrating practical applications of 8 Object-Oriented Software Design Patterns in Java 17/25 and React.**

---

## 🏛️ Implemented Design Patterns Matrix

Every feature in **HostelHub** is anchored directly to an enterprise Java design pattern without simulated logic:

| # | Design Pattern | Category | Java Classes & Packages | Practical Functional Application |
|---|---|---|---|---|
| **1** | **Builder** | Creational | `app.patterns.builder.StudentBuilder`<br>`app.model.Student`<br>`app.service.StudentService` | Multi-step interactive student profile builder with strict validation rules (academic year 1–5, merit score 0–100, phone regex, hostel preferences). |
| **2** | **Strategy** | Behavioral | `app.patterns.strategy.AllocationStrategy`<br>`app.patterns.strategy.MeritBasedAllocationStrategy`<br>`app.patterns.strategy.FirstComeFirstServedStrategy`<br>`app.patterns.strategy.PreferenceBasedAllocationStrategy` | Interchangeable room allocation algorithms: Merit-based ranking, First-Come-First-Served queue, or preference-based hostel matching. |
| **3** | **Chain of Responsibility** | Behavioral | `app.patterns.chain.ComplaintHandler`<br>`app.patterns.chain.WardenHandler`<br>`app.patterns.chain.ChiefWardenHandler`<br>`app.patterns.chain.DeanHandler` | Dynamic complaint escalation hierarchy: `Student → Warden → Chief Warden → Dean`, automatically evaluating severity levels (Low, Medium, High, Critical). |
| **4** | **Observer** | Behavioral | `app.patterns.observer.ComplaintPublisher`<br>`app.patterns.observer.ComplaintObserver`<br>`app.patterns.observer.StudentNotificationObserver`<br>`app.patterns.observer.StaffNotificationObserver` | Real-time push notifications and Server-Sent Events (SSE) broadcasting complaint lifecycle events and status updates to subscribers. |
| **5** | **Mediator** | Behavioral | `app.patterns.mediator.ComplaintMediator`<br>`app.patterns.mediator.ConcreteComplaintMediator`<br>`app.patterns.mediator.HostelMediator` | Decoupled interaction and coordination between students, hostel wardens, and maintenance personnel without tight coupling. |
| **6** | **Template Method** | Behavioral | `app.patterns.template.HostelProcess`<br>`app.patterns.template.CheckInProcess`<br>`app.patterns.template.CheckOutProcess`<br>`app.service.ProcessService` | Standardized, invariant 5-step lifecycle process sequence: (1) Identity check → (2) Allocation state → (3) Room inventory → (4) Keys & dues clearance → (5) DB state update. |
| **7** | **Prototype** | Creational | `app.patterns.prototype.RoomPrototype`<br>`app.patterns.prototype.RoomPrototypeRegistry`<br>`app.model.RoomTemplate`<br>`app.model.Room` | Deep-cloning room templates via `clonePrototype()` to create customized room configurations (capacity, fees, amenities) without re-instantiation from scratch. |
| **8** | **Singleton** | Creational | `app.patterns.singleton.DatabaseManager` | Thread-safe, centralized SQLite connection management and automated schema initialization with foreign key constraints and connection pooling. |

---

## 🚀 Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript (Vite 8)
- **Styling**: Tailwind CSS (Dark theme: deep navy `#080b11`, cyan `#06b6d4`, electric violet `#8b5cf6`)
- **3D Graphics**: Three.js (Interactive architectural hostel building model with rotating floor views & isometric 3D floor inspector)
- **Animations**: GSAP + ScrollTrigger, Framer Motion
- **Analytics & Data Vis**: Recharts
- **Icons**: Lucide React
- **Micro-interactions**: Canvas Confetti

### Backend
- **Language**: Java 17 / 25 LTS
- **Build System**: Apache Maven 3.9+
- **REST API Server**: Embedded HTTP Server (`jdk.httpserver`) with CORS, JSON DTO serialization via Jackson (`jackson-databind`, `jackson-datatype-jsr310`)
- **Real-time Streaming**: Server-Sent Events (SSE) Broadcaster
- **Database**: SQLite (`sqlite-jdbc` 3.45.3) with thread-safe Singleton `DatabaseManager`
- **Security**: BCrypt password hashing (`jbcrypt`)
- **Testing**: JUnit 5 Jupiter engine (19 unit/integration test cases, 100% passing)

---

## ⚡ Quick Start

### 1. Run Java REST Backend
```sh
# From Hostel-Manager root directory:
mvn compile exec:java "-Dexec.mainClass=app.Main" "-Dexec.args=--server-only"
```
The REST API server starts on **`http://localhost:8080`**.

### 2. Run React Frontend
```sh
# In another terminal:
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Personas & Credentials

The application includes an instant **1-Click Role Switcher** in the navigation header:

| Role | Username | Password | Persona & Scope |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | System Administrator (Full analytics, Strategy engine, Prototype template cloner) |
| **Warden** | `warden1` | `password123` | John Warden (Block complaints queue, Mediator maintenance dispatch) |
| **Chief Warden**| `chiefwarden1`| `password123`| Dr. Evelyn Reed (Campus escalation handler) |
| **Dean** | `dean1` | `password123` | Prof. Arthur Vance (Dean of Student Affairs, Critical safety escalations) |
| **Maintenance** | `maint1` | `password123` | Bob Builder (Work orders & repair tasks) |
| **Student** | `student1` | `password123` | Alice Smith (Year 2, Sarojini Bhawan Room S-101) |
| **Student** | `student2` | `password123` | Rahul Sharma (Year 3, Pending Allocation Queue) |

---

## 📡 REST API Documentation

- `POST /api/auth/login`: Authenticate user and retrieve profile & active allocation
- `POST /api/auth/register`: Create user account and student record
- `GET  /api/students`: Retrieve all student profiles
- `POST /api/students`: Create new student profile via **Builder Pattern**
- `GET  /api/hostels`: List all hostel blocks
- `GET  /api/rooms`: List rooms, capacities, and facilities across all floors
- `POST /api/allocations/requests`: Queue student room allocation request
- `POST /api/allocations/execute`: Run room allocation engine using **Strategy Pattern** (`MERIT_BASED`, `FIRST_COME_FIRST_SERVED`, `PREFERENCE_BASED`)
- `GET  /api/complaints`: List complaints filtered by student or handler
- `POST /api/complaints`: Lodge complaint via **Mediator Pattern** & notify **Observers**
- `POST /api/complaints/{id}/escalate`: Escalate complaint via **Chain of Responsibility** (`Warden -> Chief Warden -> Dean`)
- `POST /api/complaints/{id}/assign`: Assign maintenance staff via **Mediator**
- `POST /api/process/execute`: Run **Template Method Pattern** (`CHECK_IN` or `CHECK_OUT`)
- `GET  /api/process/logs`: Retrieve audit execution traces
- `POST /api/templates/clone`: Clone and customize room template via **Prototype Pattern**
- `GET  /api/system/stats`: Live system KPIs
- `GET  /api/system/singleton-info`: Inspect **Singleton Pattern** `DatabaseManager` instance identity
- `GET  /api/patterns/meta`: Complete metadata for the Architecture Explorer
- `GET  /api/events`: Live Server-Sent Events stream

---

## 🧪 Testing

Run test suite:
```sh
mvn test
```
All 19 test cases across patterns, services, and integration pass with 0 failures:
- `BuilderTest`: Validation constraints & profile construction
- `StrategyTest`: Merit-based, FCFS, and Preference strategies
- `ChainTest`: Handler linking and escalation thresholds
- `ObserverTest`: Subscription and event publishing
- `MediatorTest`: Loose-coupled colleague interaction
- `TemplateTest`: Invariant process step execution
- `PrototypeTest`: Deep-cloning of room prototypes
- `SingletonTest`: Thread-safe identity preservation
- `AllocationServiceTest` & `ComplaintServiceTest`: Transactional consistency
- `IntegrationTest`: End-to-end student lifecycle
