# Sopranostampi App Documentation

This document provides a comprehensive overview of the features and functionality of the Sopranostampi application. This app is designed to be a powerful tool for managing molds, components, machines, and related operational data.

## 1. User Roles and Login

The application features a role-based access control system with two main user types:

*   **Administrator (`Admin`)**: Admins have full access to all data and functionality. They can create, edit, and delete all items (molds, components, machines), manage user accounts and permissions, view all analytics, and approve maintenance requests. The default admin user codes are `admin` and `guilhermevolp93`.
*   **Standard User (`User`)**: Standard users have restricted access. They can only view the items (molds, components, machines) they have been explicitly granted permission for. Their view is tailored to their specific responsibilities. The default standard user is `user01`.

To log in, simply enter your assigned user code on the main page.

### Permission System

The permission system for Standard Users is designed to be intelligent and efficient:
- If a user is granted access to a **mold**, they automatically gain view access to all **components** associated with that mold and the **machine** the mold is assigned to.
- If a user is granted access to a **component**, they automatically gain view access to all **molds** that can produce that component.

This ensures that users have access to the full context of the items they are responsible for without needing permissions to be assigned one by one.

## 2. Main Sections

### Dashboard
The Dashboard is the central landing page after logging in. It provides a high-level overview of key metrics and quick access to common tasks.
- **Stats Cards**: Displays key performance indicators (KPIs) like the total number of molds, molds currently in maintenance, and molds at external suppliers (visible to admins).
- **Upcoming Events**: Shows a list of future scheduled events, such as maintenance or repairs, with overdue events highlighted.
- **Associated Mold Finder**: A utility to quickly find which molds are required to produce a specific component.
- **Quick Production Log**: A form to rapidly log production runs (good and scrapped pieces) for any component by searching for its code.

### Molds
This section is for managing the mold inventory.
- **List View**: Displays all molds, including parent-child relationships (e.g., a sub-mold listed under its parent). You can search and filter by status. Admins can also import/export data via CSV.
- **Detail View**: Clicking on a mold shows all its details, including:
    - Basic info, position (internal/external), and technical/management data.
    - **Attachments**: Upload and manage technical drawings, 3D files (STEP, IGES), and other documents.
    - **Associated Components**: View a list of all components that can be produced by this mold.
    - **Event History**: A timeline of all events (maintenance, repairs, costs) related to this mold. Admins can add, edit, or complete events from here.

### Components
This section manages the inventory of all manufactured components.
- **List View**: A searchable and filterable table of all components. Admins can import/export data via CSV.
- **Detail View**: Provides a complete picture of a component, including:
    - Basic info, material, weight, and total production cycles.
    - **Stamping Data**: A detailed list of injection process parameters (e.g., cycle time, temperatures, pressures). This data can be edited by any user with access.
    - **Stamping Data History**: An audit log tracking all changes made to the stamping parameters, including who made the change and when.
    - **Production History**: A log of all individual production runs, showing good vs. scrapped parts.
    - **Attachments & Checklist**: Manage component-specific files and quality control checklists.

### Machines
This section, visible to administrators, is for managing production machinery.
- **List View**: A searchable and filterable table of all machines.
- **Detail View**: Shows machine details (type, serial number, cost) and its complete event history (maintenance, repairs).

## 3. Workflows and Features

### Event Management
Events track the lifecycle of molds and machines.
- **Creating Events**: Admins can add events directly from an item's detail page, specifying the type (Maintenance, Repair, etc.), description, and estimated end date.
- **Updating Events**: Open events can be edited. You can also mark an event as "Completed," which automatically sets the item's status back to "Operativo" (Operational) if no other open events exist.

### Maintenance Requests
This admin-only section streamlines the process for requesting work on assets.
- **Submitting a Request**: Any user can submit a request for maintenance via the "New Request" page, specifying the item and the reason.
- **Approval Workflow**: Administrators can review pending requests. Approving a request automatically creates a new "Maintenance" event for the specified item and puts it into the "In Manutenzione" state.

### Analytics
The Analytics Dashboard (admin-only) provides visual insights into key business metrics:
- **Mold Status Distribution**: A pie chart showing the current status of all molds.
- **Molds by Supplier**: A bar chart showing how many molds are located at each external supplier.
- **Component Scrap Rate**: A bar chart highlighting which components have the highest percentage of scrapped parts, helping to identify quality issues.
- **Event Schedule Adherence**: A chart comparing the estimated vs. actual completion dates for events, showing the average delay for different event types.
- **Maintenance Costs Over Time**: A line chart tracking total maintenance and repair costs per month.

### Localization
The user interface can be switched between **English** and **Italiano** using the language switcher in the header.
