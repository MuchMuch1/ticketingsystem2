export interface Ticket {
    t_id: number;
    name: string;
    email: string;
    type: string;
    category: string;
    desc: string;
    status: string;
    priority: string; 
    employeeAssigned: string; 
    date: Date;
    dateDue: Date;
    dateLastEdit: Date;
    img: string;
  }