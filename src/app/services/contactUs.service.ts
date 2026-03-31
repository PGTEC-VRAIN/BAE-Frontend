import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IContactUs } from '../pages/contact-us/contact-us-form.component';

export interface ISendEmail {
  form: IContactUs
}


@Injectable({
  providedIn: 'root'
})
export class ContactUsService {
  protected BASE_URL = environment.BASE_URL;
  private debug = true;

  constructor(private http: HttpClient) { }

  sendEmail(form: IContactUs): Observable<ISendEmail> {
    if (this.debug) {
      return of({
        form: {
          firstName: "",
          lastName: "",
          email: "",
          organization: "",
          roleInOrganization: "",
          message: "",
          privacyAccepted: false,
          marketingAccepted: false
        }
      }).pipe(delay(3000));
    }

    return this.http.post<ISendEmail>(`${this.BASE_URL}/to-do`, form);
  }
}
