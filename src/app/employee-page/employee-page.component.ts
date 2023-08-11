import { CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Ticket } from '../types/ticket.type';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-employee-page',
  templateUrl: './employee-page.component.html',
  animations: [
    trigger('headergrow', [
      state('closed', style({
          height: 0,
          width: 0,
          padding: 0,
      })),
      state('open', style({
          height: "auto",
          width: 300,
          padding: "10px"
      })),
      transition('* => *', animate(150))
  ]),
  trigger('topgrow', [
    state('closed', style({
        height: 0,
        padding: 0,
    })),
    state('open', style({
        height: "auto",
        padding: "20px"
    })),
    transition('* => *', animate(150))
]),
  ],
  styleUrls: ['./employee-page.component.css']
})
export class EmployeePageComponent {

  //#region Creation of data
    tickets: Ticket[] = [];
    foundID = 0;
    editForm: FormGroup;
    numOfTickets = 0;
    today = new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' });
    editToggled = false
    expandedElement: any | null = null;
    state = "open"; // animation
    topState = "closed"; // animation

    editType = ""
    editStatus = ""
    editPriority = ""
    editEmployee = ""

    // Filtering
    filterStatus = "All"
    filterType = "All"
    filterCategory = "All"
    filterPriority= "All"
  //#endregion

  //#region count tickets (status and priority)
    ticketOpen = this.countStatus(this.tickets, "Open");
    ticketClosed = this.countStatus(this.tickets, "Closed");
    ticketPending = this.countStatus(this.tickets, "Pending");
    ticketOnHold = this.countStatus(this.tickets, "On Hold");

    ticketNo = this.countPriority(this.tickets, "N/a");
    ticketLow = this.countPriority(this.tickets, "Low");
    ticketMed = this.countPriority(this.tickets, "Medium");
    ticketHigh = this.countPriority(this.tickets, "High");
    ticketCrit = this.countPriority(this.tickets, "Critical");
  //#endregion

  constructor(private formBuilder: FormBuilder, private http: HttpClient, public dialog: MatDialog) {
    this.editForm = this.formBuilder.group({
      type: [''],
      status: ['', Validators.required],
      employeeAssigned: ['', Validators.required],
      priority: ['', Validators.required],
      dateDue: []
    });
    this.getAllTickets();

  }

  //#region Animations
    changeState(): void {
      if (this.state == "open") {this.state = "closed"}
      else {this.state = "open"}
    }

    changeTopState(): void {
      if (this.topState == "open") {this.topState = "closed"}
      else {this.topState = "open"}
    }
  //#endregion

  // Read
  getAllTickets() {
    this.http.get<Ticket[]>("http://localhost:3000/read")
      .subscribe(
        (resultData: Ticket[]) => {
          this.tickets = resultData;
          this.numOfTickets = this.tickets.length;

          this.ticketOpen = this.tickets.filter(ticket => ticket.status === "Open").length;
          this.ticketClosed = this.tickets.filter(ticket => ticket.status === "Closed").length;
          this.ticketPending = this.tickets.filter(ticket => ticket.status === "Pending").length;
          this.ticketOnHold = this.tickets.filter(ticket => ticket.status === "On Hold").length;

          this.ticketNo = this.tickets.filter(ticket => ticket.priority === "N/a").length;
          this.ticketLow = this.tickets.filter(ticket => ticket.priority === "Low").length;
          this.ticketMed = this.tickets.filter(ticket => ticket.priority === "Medium").length;
          this.ticketHigh = this.tickets.filter(ticket => ticket.priority === "High").length;
          this.ticketCrit = this.tickets.filter(ticket => ticket.priority === "Critical").length;
          

        },
        error => {
          console.error("Error fetching tickets:", error);
          alert("Sum Ting Wong");
          // Handle error (e.g., show error message to the user)
        }

      );
      
  }

  // Filtered Read
  filterTickets() {
    const url = `http://localhost:3000/filter?status=${this.filterStatus}&type=${this.filterType}&category=${this.filterCategory}&priority=${this.filterPriority}`;
    this.http.get<Ticket[]>(url)
      .subscribe(
        (resultData: Ticket[]) => {
          this.tickets = resultData;
        },
        error => {
          console.error("Error fetching tickets:", error);
          alert("Sum Ting Wong");
          // Handle error (e.g., show error message to the user)
        }

      );
  }

  // Sorted Read
  sortedTickets(sortMethod: string) {
    this.http.get<Ticket[]>(`http://localhost:3000/sort?sortMethod=${sortMethod}`)
    .subscribe(
      (resultData: Ticket[]) => {
        this.tickets = resultData;
      },
      error => {
        console.error("Error fetching tickets:", error);
        alert("Sum Ting Wong");
        // Handle error (e.g., show error message to the user)
      }

    );
  }

  // Opens the edit section
  editToggle() {

    const setEdit = this.tickets.find(ticket => ticket.t_id === this.foundID);
    if (setEdit) {
      this.editType = setEdit.type
      this.editStatus = setEdit.status
      this.editPriority = setEdit.priority
      this.editEmployee = setEdit.employeeAssigned
    }
  
    this.editToggled = !this.editToggled
  }

  // Update
  onEdit() {
    if (this.editForm.valid) {
      const ticketToEdit = this.tickets.find(ticket => ticket.t_id === this.foundID);
      const myType = this.editForm.value.type;
      const myStatus = this.editForm.value.status;
      const myPriority = this.editForm.value.priority;
      const myEmployee = this.editForm.value.employeeAssigned;
      const myDateDue = this.editForm.get('dateDue')!.value

      console.log(myEmployee)
      console.log(myDateDue)

      if (ticketToEdit) {
        // Check if any of the fields are empty, if it is not empty, use the new one
        const updatingType = myType !== '' ? myType : ticketToEdit.type;
        const updatingStatus = myStatus !== '' ? myStatus : ticketToEdit.status;
        const updatingPriority = myPriority !== '' ? myPriority : ticketToEdit.priority;
        const updatingEmployee = myEmployee !== '' ? myEmployee : ticketToEdit.employeeAssigned;
        const updatingDateDue = myDateDue !== '' ? myDateDue : ticketToEdit.dateDue;

        let bodyData = {
          "type": updatingType,
          "status": updatingStatus,
          "priority": updatingPriority,
          "employeeAssigned": updatingEmployee,
          "dateDue": updatingDateDue,
          "dateLastEdit": this.today
        }

        this.http.put("http://localhost:3000/update/" +this.foundID,bodyData)
        .subscribe((resultData:any)=>{
          this.getAllTickets();
          alert("Updated!");
        });
      }
    } else {
      alert("Your editing skills ain't right, chief");
    }
    this.editToggled = false
  }

  findID(button_Id: any) {
    const buttonId = 'btn_'+ button_Id;

    this.foundID = this.tickets.find(ticket => "btn_" + ticket.
    t_id === buttonId)?.t_id || 0;
  }

  // Delete
  delete() {
    const ticketToDelete = this.tickets.find(ticket => ticket.t_id === this.foundID);
    if (ticketToDelete && 
      confirm(`
        [${ticketToDelete.t_id}] Are you sure to delete
        ${ticketToDelete.name}'s ${ticketToDelete.type}
        ticket with description\n'${ticketToDelete.desc}'?\n
        It is currently ${ticketToDelete.status}
        and has ${ticketToDelete.priority} priority.\n\n
        Created on ${ticketToDelete.date}`
      )) 
      {
        this.http.delete("http://localhost:3000/delete/" + this.foundID)
            .subscribe((resultData: any) => {
                this.getAllTickets();
                alert("Successfully deleted record!");
            });
      }
      this.editToggled = false
  }

  // Checks if the ticket has an image, the button will disable if the image link is empty
  hasImage(t_id: number): boolean {
    return !this.tickets.some(t => t.t_id === t_id && t.img !== '');
  }
  openDialog() {
    const matchingTicket = this.tickets.find(t => t.t_id === this.foundID);
    if (matchingTicket) {
      const dialogConfig: MatDialogConfig = {
        data: { sendTickets: this.tickets, foundID: this.foundID }
      };
      this.dialog.open(imageDialog, dialogConfig);
    }
  }

  // Counting
  countStatus(tickets: Ticket[], status: string): number {
    return tickets.reduce((count, t) => (t.status === status ? count + 1 : count), 0);
  }
  countPriority(tickets: Ticket[], priority: string): number {
    return tickets.reduce((count, t) => (t.priority === priority ? count + 1 : count), 0);
  }

  priorityColor(priority: string): string {
    switch (priority) {
      case 'Medium':
        return 'myBG_Medium';
      case 'High':
        return 'myBG_High';
      case 'Critical':
        return 'myBG_Critical';
      default:
        return 'myBG';
    }
  }

  statusColor(status: string): string {
    switch (status) {
      case 'Open':
        return 'status_Open';
      case 'Pending':
        return 'status_Pending';
        case 'On Hold':
          return 'status_OnHold';
        case 'Closed':
          return 'status_Closed';
      default:
        return 'status';
    }
  }

}

@Component({
  selector: 'dialog-elements-example-dialog',
  templateUrl: 'imageDialog.html',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
})
export class imageDialog {
  foundID: number;
  imageLink = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { sendTickets: Ticket[], foundID: number }) {
    this.foundID = data.foundID;

    const matchingTicket = data.sendTickets.find(t => t.t_id === this.foundID);
    if (matchingTicket) {
      this.imageLink = matchingTicket.img;
    }
  }

  errormessage = ""
  onImageError() {
    this.errormessage = "Image is broken! :O"
  }
}
