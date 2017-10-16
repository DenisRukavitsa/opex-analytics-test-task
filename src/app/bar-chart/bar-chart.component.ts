import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {
  groupByOptions = ['Day', 'Week'];
  groupBy = 'Day';
  productId = 1;
  invalidProductID = false;
  productIDForm: FormGroup;
  productIDControl: AbstractControl;

  constructor(formBuilder: FormBuilder) {
    this.productIDForm = formBuilder.group({
      'productIDControl': ['', Validators.required],
    });
    this.productIDControl = this.productIDForm.controls['productIDControl'];
    this.productIDControl.setErrors(null);
  }

  ngOnInit() {
    this.drawSvg();
  }

  drawSvg() {
    // Validations
    if (this.productIDControl.hasError('required')) {
      return;
    }

    if (this.productId >= 1 && this.productId <= 100) {
      this.productIDControl.setErrors(null);
      this.invalidProductID = false;
    } else {
      this.productIDControl.setErrors({});
      this.invalidProductID = true;
      return;
    }

    // Clearing the previous svg group
    const gElement = document.getElementById('g');
    if (gElement) {
      gElement.parentNode.removeChild(gElement);
    }

    // setting up the svg variables
    const svg = d3.select('svg'),
      margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = +svg.attr('width') - margin.left - margin.right,
      height = +svg.attr('height') - margin.top - margin.bottom;

    const xName = 'Date',
      yName = 'On Hand Value';

    const x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

    // group svg element
    const g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('id', 'g');

    // filtering and grouping the data
    const groupBy = this.groupBy;
    const productId = this.productId;
    const june2014weekStarts = ['6/2/2014', '6/9/2014', '6/16/2014', '6/23/2014', '6/30/2014'];
    let previousDate = june2014weekStarts[0];
    let previousProduct = 'Product 1';
    let productChanged = false;
    let weekCounter = 1;
    let sum = 0;

    d3.csv('../../assets/Daily Inventory.csv', (d) => {
      d[yName] = +d[yName];

      if (('Product ' + productId) === previousProduct && previousProduct !== d['Product ID']) {
        productChanged = true;
        previousProduct = d['Product ID'];
      } else {
        productChanged = false;
        previousProduct = d['Product ID'];
      }

      if (+(d['Product ID'] as string).split(' ')[1] === productId || productChanged) {

        if (groupBy === 'Day') {
          if (previousDate !== d[xName] || productChanged) {
            const tempSum = sum;
            const tempDate = previousDate;
            sum = 0;
            sum += d[yName];
            previousDate = d[xName];
            d[yName] = tempSum;
            d[xName] = +(tempDate as string).split('/')[1];
            return d;
          } else {
            sum += d[yName];
            previousDate = d[xName];
          }

        } else {
          if ((previousDate !== d[xName] && june2014weekStarts.includes(d[xName])) || productChanged) {
            const tempSum = sum;
            sum = 0;
            sum += d[yName];
            previousDate = d[xName];
            d[yName] = tempSum;
            d[xName] = weekCounter;
            weekCounter++;
            return d;
          } else {
            sum += d[yName];
            previousDate = d[xName];
          }
        }
      }

    // drawing the chart
    }, function(error, data) {
      if (error) { throw error; }

      x.domain(data.map(d => d[xName]));
      y.domain([0, d3.max(data, d => d[yName])]);

      // x-axis
      g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

      // y-axis
      g.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y).ticks(10))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end');

      // bars
      const rects = g.selectAll('rect')
        .data(data);

      rects.enter().append('rect')
        .attr('fill', 'steelblue')
        .attr('x', d => x(d[xName]))
        .attr('y', d => y(d[yName]))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d[yName]));
    });
  }

}
