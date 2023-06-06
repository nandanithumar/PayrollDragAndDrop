import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { fabric } from 'fabric';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private canvas!: fabric.Canvas;
  private selectedObject: fabric.Object | null = null;
  fontSize = 16;
  fontColor = '#000000';
  fontFamily = 'Arial';
  fontWeight = 'Normal';
  textBoxText = '';
  underline = false;
  textPanel = false;
  textAlign: string = 'left';

  constructor() {}

  ngAfterViewInit() {
    this.canvas = new fabric.Canvas('canvas');
    this.canvas.setHeight(650);
    this.canvas.setWidth(700);
  }

  onDragStart(event: DragEvent, field: string) {
    event.dataTransfer!.setData('text/plain', field);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    
  }

  setSelectedObject() {
    this.selectedObject = this.canvas.getActiveObject();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const field = event.dataTransfer!.getData('text/plain');
    const pointer = this.canvas.getPointer(event);

    if (field === 'textbox') {
      const textbox = new fabric.Textbox(this.textBoxText, {
        left: pointer.x,
        top: pointer.y,
        width: 300,
        height: 30,
        fill: 'black',
        borderColor: 'black',
        cornerColor: 'black',
        cornerSize: 6,
        transparentCorners: false,
        fontSize: this.fontSize,
        fontFamily: this.fontFamily,
        editable: true,
        selectable: true,
      });

      this.canvas.add(textbox);
      this.canvas.setActiveObject(textbox);
      this.canvas.renderAll();
    } else {
      const textbox = new fabric.Textbox(field, {
        left: pointer.x + 150,
        top: pointer.y,
        width: 300,
        height: 30,
        fill: 'black',
        borderColor: 'black',
        cornerColor: 'black',
        cornerSize: 6,
        transparentCorners: false,
        fontSize: this.fontSize,
        fontFamily: this.fontFamily,
        editable: true,
        selectable: true,
      });

      const label = new fabric.Text(field, {
        left: pointer.x,
        top: pointer.y,
        fontSize: this.fontSize,
        fontFamily: this.fontFamily,
        fill: this.fontColor,
        selectable: true,
      });

      this.canvas.add(label);
      this.canvas.add(textbox);
      this.canvas.setActiveObject(textbox);
      this.canvas.renderAll();
    }
  }

  setFontFamily(fontFamily: Event) {
    this.setSelectedObject();
    let fontFamilyInString: string = (fontFamily.target as HTMLInputElement)
      .value;
    if (
      this.selectedObject instanceof fabric.Textbox ||
      this.selectedObject instanceof fabric.Text
    ) {
      this.selectedObject.set('fontFamily', fontFamilyInString);
      this.canvas.renderAll();
    }
  }

  setTextAlign() {
    this.setSelectedObject();
    if (this.selectedObject instanceof fabric.Textbox) {
      const textbox = this.selectedObject as fabric.Textbox;
      textbox.set('textAlign', this.textAlign);
      this.canvas.renderAll();
    }
  }

  setFontSize() {
    this.setSelectedObject();
    if (
      this.selectedObject instanceof fabric.Textbox ||
      this.selectedObject instanceof fabric.Text
    ) {
      this.selectedObject.set('fontSize', this.fontSize);
      this.canvas.renderAll();
    }
  }

  setFontColor() {
    this.setSelectedObject();
    this.selectedObject?.set('fill', this.fontColor);
    this.canvas.renderAll();
  }

  setFontWeight(fontWeight: Event) {
    this.setSelectedObject();
    let fontWeightValue: string = (fontWeight.target as HTMLInputElement).value;
    if (
      this.selectedObject instanceof fabric.Textbox ||
      this.selectedObject instanceof fabric.Text
    ) {
      this.selectedObject.set('fontWeight', fontWeightValue);
      this.canvas.renderAll();
    }
  }

  deleteSelectedField() {
    if (this.selectedObject) {
      this.canvas.remove(this.selectedObject);
      this.selectedObject = null;
      this.canvas.renderAll();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      this.setSelectedObject();
      this.deleteSelectedField();
    }
  }

  onDragStartTextBox(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', 'textbox');
  }

  setUnderline(event: Event) {
    this.setSelectedObject();
    if (
      this.selectedObject instanceof fabric.Textbox ||
      this.selectedObject instanceof fabric.Text
    ) {
      const textDecoration: boolean = (event.target as HTMLInputElement).checked
        ? true
        : false;
      this.selectedObject.set('underline', textDecoration);
      this.canvas.renderAll();
    }
  }

  clearCanvas() {
    this.canvas.clear();
  }

  generatePDF() {
    const canvasElement = document.getElementById('canvas'); // Replace 'myCanvas' with the ID of your canvas element

    if (canvasElement instanceof HTMLElement) {
      domtoimage.toPng(canvasElement)
        .then((dataUrl) => {
          const pdf = new jsPDF();
          const img = new Image();
          img.src = dataUrl;
  
          img.onload = () => {
            const imgWidth = img.width;
            const imgHeight = img.height;
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
  
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('canvas.pdf');
          };
        })
        .catch((error) => {
          console.error('Error generating PDF:', error);
        });
    }
  }
}
