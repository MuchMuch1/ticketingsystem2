import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Ticket } from '../types/ticket.type';

@Component({
  selector: 'app-customer-page',
  templateUrl: './customer-page.component.html',
  styleUrls: ['./customer-page.component.css'],
})
export class CustomerPageComponent {
  ticketForm: FormGroup;
  today = new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' });
  showEditForm = false;
  foundID = 0;
  tickets: Ticket[] = [];

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {
    this.ticketForm = this.formBuilder.group({
      t_id: [Number],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      type: ['', Validators.required],
      category: ['', Validators.required],
      desc: ['', Validators.required],
      date: [this.today],
      dateLastEdit: [this.today],
      img: ['']
    });
    this.getAllTickets();
  }

  // Read
  getAllTickets() {
    this.http.get("http://localhost:3000/read")
    .subscribe((resultData: any)=>{
      console.log(this.tickets);
      this.tickets = resultData;
    })
  }

  private getLatestTId(): number {
    return Math.max(...this.tickets.map(ticket => ticket.t_id), 0);
  }

  onSubmit() {
    if (this.ticketForm.valid) {
      const newTicket: Ticket = {
        t_id: this.getLatestTId() + 1,
        name: this.ticketForm.value.name,
        email: this.ticketForm.value.email,
        type: this.ticketForm.value.type,
        category: this.ticketForm.value.category,
        desc: this.ticketForm.value.desc,
        status: "Open",
        priority: "N/a",
        employeeAssigned: "To be Assigned",
        date: this.ticketForm.value.date,
        dateDue: this.ticketForm.value.date,
        dateLastEdit: this.ticketForm.value.date,
        img: this.ticketForm.value.img,
      };
      this.http.post("http://localhost:3000/create", newTicket).
      subscribe((resultData:any) => {
        console.log(resultData);
        alert("Ticket Added Successfully!");
        this.getAllTickets;
        this.ticketForm.reset();
      })
    } else {
      alert("Something ain't right, chief");
    }
  }
  
}
