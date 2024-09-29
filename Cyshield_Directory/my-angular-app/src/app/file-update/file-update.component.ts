import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FileUploadService } from '../api/upload_file/file-upload.service';

@Component({
  selector: 'app-file-update',
  templateUrl: './file-update.component.html',
  styleUrls: ['./file-update.component.css']
})
export class FileUpdateComponent {

  selectedFile: File | null = null;
  warningMessage: String= ""

  constructor(private fileUploadService: FileUploadService, private router: Router) { }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log('Selected file:', this.selectedFile);
  }

  onUpload() {
    if (this.selectedFile) {
      console.log('Uploading file:', this.selectedFile);
      this.warningMessage="Please Wait";
      this.fileUploadService.uploadFile(this.selectedFile).subscribe(
        (response) => {
          console.log('File uploaded successfully:', response);
          this.router.navigate(['/dashboard']);
        },
        (error) => {
          console.error('File upload failed:', error);
        }
      );
    } else {
      console.error('No file selected');
    }
  }
}