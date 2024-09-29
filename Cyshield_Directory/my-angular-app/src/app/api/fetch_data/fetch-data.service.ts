import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FetchDataService {

  private subnetGETAPIUrl = 'http://localhost:9040/api/FileUpload/subnets';
  private subnetGETBySubnetIdAPIUrl = 'http://localhost:9040/api/FileUpload/subnet';
  private subnetPUTBySubnetIdAPIUrl = 'http://localhost:9040/api/FileUpload/subnets_update';
  private subnetDELETEAPIUrl = 'http://localhost:9040/api/FileUpload/subnet_delete';

  private ipsGETAPIUrl = 'http://localhost:9040/api/FileUpload/ips';
  private ipGETByIpIdAPIUrl = 'http://localhost:9040/api/FileUpload/ip';
  private ipPUTByIpIdAPIUrl = 'http://localhost:9040/api/FileUpload/ip_update'
  private ipDELETEAPIUrl = 'http://localhost:9040/api/FileUpload/ip_delete';

  private verifyTokenPOSTAPIUrl = 'http://localhost:9040/api/Auth/verify-token';

  jwtToken: string | null = null;
  user: { username: string, email: string, password: string, role: string } | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.jwtToken = this.authService.getToken();
    this.user = this.authService.getUserData();
   }

  getSubnets(): Observable<Subnet[]> {
    return this.verifyToken().pipe(
      switchMap(() => {
        console.log("Authenticated to send this request");
        const headers = this.createAuthorizationHeader();
        return this.http.get<any[]>(`${this.subnetGETAPIUrl}`, { headers }).pipe(
          map(subnets => {
            console.log('Raw Subnets Response:', subnets);
            return subnets.map(subnet => ({
              SubnetId: subnet.subnetId,
              SubnetName: subnet.subnetName,
              SubnetAddress: subnet.subnetAddress,
              CreatedBy: subnet.createdBy,
              CreatedAt: new Date(subnet.createdAt)
            }));
          }),
          catchError(this.handleError)
        );
      })
    );
  }

   // New method to get subnets by username
   getSubnetsByUsername(): Observable<Subnet[]> {
    return this.verifyToken().pipe(
      switchMap(() => {
        console.log(`Fetching subnets for user: ${this.user?.username}`);
        const headers = this.createAuthorizationHeader();
        const url = `${this.subnetGETAPIUrl}/${this.user?.username}`;
        return this.http.get<any[]>(url, { headers }).pipe(
          map(subnets => {
            console.log('Raw Subnets Response:', subnets);
            return subnets.map(subnet => ({
              SubnetId: subnet.subnetId,
              SubnetName: subnet.subnetName,
              SubnetAddress: subnet.subnetAddress,
              CreatedBy: subnet.createdBy,
              CreatedAt: new Date(subnet.createdAt)
            }));
          }),
          catchError(this.handleError)
        );
      })
    );
  }

  getSubnetBySubnetId(subnetId: number): Observable<Subnet> {
    return this.verifyToken().pipe(
      switchMap(() => {
        console.log(`Fetching subnet for subnet ID: ${subnetId}`);
        const headers = this.createAuthorizationHeader();
        const url = `${this.subnetGETBySubnetIdAPIUrl}/${subnetId}`;
        return this.http.get<any[]>(url, { headers }).pipe(
          tap(rawSubnet => {
            console.log('Raw Subnet Response:', rawSubnet); // Log the raw response
          }),
          map(subnetArray => {
            const subnet = subnetArray[0]; // Access the first element of the array
            return {
              SubnetId: subnet.subnetId,
              SubnetName: subnet.subnetName,
              SubnetAddress: subnet.subnetAddress,
              CreatedBy: subnet.createdBy,
              CreatedAt: new Date(subnet.createdAt)
            };
          }),
          catchError(this.handleError)
        );
      })
    );
  }
  
  updateSubnet(subnet: Subnet): Observable<Subnet> {
    return this.verifyToken().pipe(
      switchMap(() => {
        console.log(`Updating subnet with ID: ${subnet.SubnetId}`);
        const headers = this.createAuthorizationHeader();
        const url = `${this.subnetPUTBySubnetIdAPIUrl}`; // Ensure the URL includes the subnet ID
        return this.http.put(url, subnet, { headers, responseType: 'text' }).pipe(
          map(response => {
            console.log('Updating Response:', response);
            // Assuming the response is a success message, you can return the original subnet or a new one
            return subnet;
          }),
          catchError(this.handleError)
        );
      })
    );
  }

  // New method to delete a subnet
  deleteSubnet(subnetId: number): Observable<void> {
    return this.http.delete<void>(`${this.subnetDELETEAPIUrl}/${subnetId}`, { headers: this.createAuthorizationHeader() }).pipe(
        catchError(this.handleError) // handle error properly
    );
}


  getIPs(): Observable<IP[]> {
    return this.verifyToken().pipe(
      switchMap(() => {
        console.log("Authenticated to send this request");
        const headers = this.createAuthorizationHeader();
        const body = { username: this.user?.username };
        return this.http.get<any[]>(`${this.ipsGETAPIUrl}/${this.user?.username}`, { headers }).pipe(
          map(ips => {
            console.log('Raw IPs Response:', ips);
            return ips.map(ip => ({
              IpId: ip.ipId,
              IpAddress: ip.ipAddress,
              SubnetId: ip.subnetId,
              CreatedBy: ip.createdBy,
              CreatedAt: new Date(ip.createdAt)
            }));
          }),
          catchError(this.handleError)
        );
      })
    );
  }

  getIpByIpId(ipId: number): Observable<IP> {
    return this.verifyToken().pipe(
      switchMap(() => {
        console.log(`Fetching subnet for ip ID: ${ipId}`);
        const headers = this.createAuthorizationHeader();
        const url = `${this.ipGETByIpIdAPIUrl}/${ipId}`;
        return this.http.get<any[]>(url, { headers }).pipe(
          tap(rawIp => {
            console.log('Raw Subnet Response:', rawIp); // Log the raw response
          }),
          map(IpArray => {
            const ip = IpArray[0]; // Access the first element of the array
            return {
              IpId: ip.ipId,
              IpAddress: ip.ipAddress,
              SubnetId: ip.subnetId,
              CreatedBy: ip.createdBy,
              CreatedAt: new Date(ip.createdAt)
            };
          }),
          catchError(this.handleError)
        );
      })
    );
  }

  updateIp(ip: IP): Observable<IP> {
    return this.verifyToken().pipe(
      switchMap(() => {
        console.log(`Updating subnet with ID: ${ip.IpId}`);
        const headers = this.createAuthorizationHeader();
        const url = `${this.ipPUTByIpIdAPIUrl}`; // Ensure the URL includes the subnet ID
        return this.http.put(url, ip, { headers, responseType: 'text' }).pipe(
          map(response => {
            console.log('Updating Response:', response);
            // Assuming the response is a success message, you can return the original subnet or a new one
            return ip;
          }),
          catchError(this.handleError)
        );
      })
    );
  }

  // New method to delete a subnet
  deleteIp(ipId: number): Observable<void> {
    return this.http.delete<void>(`${this.ipDELETEAPIUrl}/${ipId}`, { headers: this.createAuthorizationHeader() }).pipe(
        catchError(this.handleError) // handle error properly
    );
}

  private verifyToken(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const body = { token: token };
    return this.http.post(this.verifyTokenPOSTAPIUrl, body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private createAuthorizationHeader(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

}

export interface Subnet {
  SubnetId: number;
  SubnetName: string; // Changed from number to string
  SubnetAddress: string;
  CreatedBy: number;
  CreatedAt: Date;
}

export interface IP {
  IpId: number;
  IpAddress: string;
  SubnetId: number;
  CreatedBy: number;
  CreatedAt: Date;
}