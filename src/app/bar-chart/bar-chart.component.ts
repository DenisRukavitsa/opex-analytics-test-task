import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { HttpService } from '../http.service';
import { MdDialog } from '@angular/material';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import * as d3 from 'd3';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {
  readonly groupByOptions = ['day', 'week'];
  readonly mandatoryColumns = ['Date', 'On Hand Value'];
  uploadLoading = true;
  showLoading = false;
  groupBy = 'day';
  productIds = [];
  productId: number;
  productIdError = '';
  productIDControl: AbstractControl;

  // Handler for errors that can occur during connecting to the server
  private handleHttpConnectionError = (err) => {
    this.uploadLoading = false;
    console.log(err);
    this.showErrorDialog(
      `Error happened during accessing the server: "${err.status} ${err.statusText}". Please try again later.`);
  }

  // injecting dependencies and setting up the Product ID input
  constructor(formBuilder: FormBuilder,
              private httpService: HttpService,
              private dialog: MdDialog) {
    const productIDForm = formBuilder.group({
      'productIDControl': [''],
    });
    this.productIDControl = productIDForm.controls['productIDControl'];
    this.productIDControl.setErrors(null);

    this.fetchProductIds();
  }

  ngOnInit() {
  }

  // Upload CSV button click handler
  uploadCsv(input: HTMLInputElement) {
    input.click();
  }

  // Handler for file uploaded event
  csvUploaded($event) {
    this.uploadLoading = true;
    const file = $event.target.files[0];
    const fileReader = new FileReader();

    // file validations
    if (!(file.name as string).toLowerCase().endsWith('.csv')) {
      this.uploadLoading = false;
      this.showErrorDialog('Please upload the file with .csv extension.');
      return;
    }

    // uploading completed, parsing the file
    fileReader.onloadend = () => {
      this.parseCsv(fileReader.result as string);
      $event.target.value = '';
    };
    fileReader.readAsText(file);
  }

  // Parsing the CSV file
  parseCsv(csv: string) {
    // Validations for CSV file columns
    const headers = csv.split('\n')[0];
    let validationFailed = false;
    this.mandatoryColumns.forEach(column => {
      if (!headers.includes(column)) {
        validationFailed = true;
        this.showErrorDialog(`Mandatory column [${column}] is not found in the uploaded file. Please try again`);
        this.uploadLoading = false;
      }
    });
    if (validationFailed) { return; }

    // parsing the float values from CSV files
    const data = d3.csvParse(csv, d => {
      d['On Hand Qty'] = +d['On Hand Qty'];
      d['Unit Cost'] = +d['Unit Cost'];
      d['On Hand Value'] = +d['On Hand Value'];
      return d;
    });

    // inserting the parsed CSV to the database
    this.httpService.insertInventory(JSON.stringify(data)).subscribe((res: any) => {
      if (res.error) {
        this.handleServerErrorResponse(res.error);
      } else {
        this.fetchProductIds();
      }
    }, this.handleHttpConnectionError);
  }

  // Handler for errors that server can return
  handleServerErrorResponse(err) {
    this.uploadLoading = false;
    this.showErrorDialog(
      `Server responded with error: "${err}". Please check your request.`);
  }

  // getting the distinct product ID values
  private fetchProductIds() {
    this.httpService.fetchProductIds().subscribe((res: any) => {
      if (res.error) {
        this.handleServerErrorResponse(res.error);
      } else {
        this.productIds = [];
        res.data.forEach(val => {
          this.productIds.push(val.productid);
        });
      }

      this.uploadLoading = false;
    }, this.handleHttpConnectionError);
  }

  // Showing the error dialog
  private showErrorDialog(message: string) {
    this.dialog.open(ErrorDialogComponent, {
      data: message,
      width: '600px'
    });
  }

  // drawing the chart
  drawSvg() {
    // Validations for Product ID input
    if (!this.productId && !(this.productId === 0)) {
      this.productIDControl.markAsTouched();
      this.productIDControl.setErrors({});
      this.productIdError = 'required';
      return;
    }
    if (this.productIds.includes('Product ' + this.productId)) {
      this.productIDControl.setErrors(null);
      this.productIdError = '';
    } else {
      this.productIDControl.setErrors({});
      this.productIdError = 'undefined';
      return;
    }

    // Clearing the previous svg group
    const gElement = document.getElementById('g');
    if (gElement) {
      gElement.parentNode.removeChild(gElement);
    }

    // fetching data from the server
    this.showLoading = true;
    this.httpService.fetchInventory(this.groupBy, this.productId).subscribe((res: any) => {
      if (res.err) {
        this.showLoading = false;
        this.handleServerErrorResponse(res.error);
      } else {
        const data = res.data;

        // If data is grouped by week, the date is represented as a week of year
        // Need to convert it as a week of month
        if (this.groupBy === 'week') {
          data.forEach((value, index) => {
            value.formatted_date = index + 1;
          });
        }

        // setting up the svg variables
        const svg = d3.select('svg.chart'),
          margin = {top: 10, right: 10, bottom: 60, left: 90},
          width = +svg.attr('width') - margin.left - margin.right,
          height = +svg.attr('height') - margin.top - margin.bottom,
          x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
          y = d3.scaleLinear().rangeRound([height, 0]);

        // group svg element
        const g = svg.append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
          .attr('id', 'g');

        // domains
        x.domain(data.map(d => d.formatted_date));
        y.domain([0, d3.max(data, d => d.sum)]);

        // x-axis
        g.append('g')
          .attr('transform', 'translate(0,' + height + ')')
          .call(d3.axisBottom(x))
          .append('text')
          .style('text-anchor', 'middle')
          .style('font-size', '2em')
          .attr('x', width / 2)
          .attr('y', 50)
          .attr('fill', 'black')
          .text(`Date, grouped by ${this.groupBy}`);

        // y-axis
        g.append('g')
          .call(d3.axisLeft(y))
          .append('text')
          .attr('transform', 'rotate(-90)')
          .style('font-size', '2em')
          .attr('y', -70)
          .attr('x', -(height / 2))
          .style('text-anchor', 'middle')
          .attr('fill', 'black')
          .text(`On Hand Value, Product ${this.productId}`);

        // bars
        const rects = g.selectAll('rect')
          .data(data);
        rects.enter().append('rect')
          .attr('fill', 'steelblue')
          .attr('x', d => x(d.formatted_date))
          .attr('y', d => y(d.sum))
          .attr('width', x.bandwidth())
          .attr('height', d => height - y(d.sum));

        this.showLoading = false;
      }
    });
  }
}
