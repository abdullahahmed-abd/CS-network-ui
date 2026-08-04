// components/globalAdmin/tabs/EventsTab.jsx
import RoleEventsTab from '../../events/RoleEventsTab';

export default function EventsTab() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A1A', margin: 0 }}>
          Global Admin Events & Approval Management
        </h2>
        <p style={{ fontSize: 12, color: '#6B8F71', margin: '4px 0 0', fontWeight: 500 }}>
          Manage global events, review pending approval requests, and view event reports.
        </p>
      </div>

      <RoleEventsTab userRole="GLOBAL_ADMIN" />
    </div>
  );
}