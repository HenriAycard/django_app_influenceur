
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Camera, CameraResultType, CameraSource, Photo } from "@capacitor/camera";
import { IonButton, IonIcon } from "@ionic/angular/standalone";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-venue-picture',
    templateUrl: './venue-picture.component.html',
    styleUrls: ['../venue.component.scss'],
    standalone: true,
    imports: [IonButton, IonIcon]
})
export class VenuePicturePage implements OnInit {
    @Input() isEditing: boolean = false;
    @Input() pictureEdit: string = ""
    @Output() dataFile = new EventEmitter<FormData>();

    ngOnInit(): void {
    }

    keepCurrentPicture() {
        this.dataFile.emit(new FormData())
    }

    async chooseOrTakePicture() {
        console.log("Opening camera to choose or take picture...");
        const photo: Photo = await Camera.getPhoto({
            quality: 90,
            allowEditing: true,
            resultType: CameraResultType.Base64,
            source: CameraSource.Photos,
        })

        console.log("New Picture Triggered");
        if (photo) {
            console.log("Photo found:", photo);
            
            const mimeType = `image/${photo.format}`;            
            const blob = this.b64toBlob(photo.base64String!, mimeType);
            console.log("Blob created:", blob);

            //Generate a fake filename
            const name = 
                Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 10);
            
            const formData = new FormData();
            formData.append("file", blob, `${name}.${photo.format}`);

            this.dataFile.emit(formData)
        } else {
            this.keepCurrentPicture()
        }

    };

    public b64toBlob(b64Data: string, contentType = '', sliceSize = 512): Blob {
        const byteCharacters = atob(b64Data);
        const byteArrays: Uint8Array[] = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blobParts: BlobPart[] = byteArrays.map(b => new Uint8Array(b));
        return new Blob(blobParts, { type: contentType });
    }

}