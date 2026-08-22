export interface AdminTicket {
  id: string;
  title: string;
  lat: number;
  lng: number;
  status: 'Unassigned' | 'Open' | 'Resolved';
  aiConfidence: number;
  slaHoursLeft: number;
  citizenImage: string;
  workerImage?: string;
  department?: string;
}

export const mockAdminTickets: AdminTicket[] = [
  {
    id: "NS-1001A",
    title: "Unidentified Debris",
    lat: 28.6129, lng: 77.2295, // India Gate
    status: 'Unassigned',
    aiConfidence: 42, // Low confidence -> Needs Admin
    slaHoursLeft: 12,
    citizenImage: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "NS-1002B",
    title: "Severe Pothole",
    lat: 28.6328, lng: 77.2195, // Connaught Place
    status: 'Resolved',
    aiConfidence: 96,
    slaHoursLeft: 0,
    citizenImage: "https://images.unsplash.com/photo-1621955511667-e2c316e4575d?q=80&w=800&auto=format&fit=crop",
    workerImage: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=800&auto=format&fit=crop",
    department: "PWD"
  },
  {
    id: "NS-1003C",
    title: "Water Logging",
    lat: 28.6400, lng: 77.2100, // Karol Bagh
    status: 'Open',
    aiConfidence: 88,
    slaHoursLeft: 4,
    citizenImage: "https://images.unsplash.com/photo-1542317854-7f579d902cbf?q=80&w=800&auto=format&fit=crop",
    department: "Jal Board"
  },
  {
    id: "NS-1004D",
    title: "Blurry Image - Unknown",
    lat: 28.6250, lng: 77.2350, // Noida Border
    status: 'Unassigned',
    aiConfidence: 15, // Very low
    slaHoursLeft: 2,
    citizenImage: "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=800&auto=format&fit=crop"
  }
];
