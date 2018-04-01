import { Component, OnInit, Input, OnChanges, ViewChild, ElementRef, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { SharedProvider } from '../../../../providers/shared/shared';
import { CarLocationHomeProvider } from '../../../car-location-home/provider/car-location-home';
import { AlertController, ModalController, Events, NavController, NavParams } from 'ionic-angular';
import { TooltipAlertComponent } from '../tooltip-alert/tooltip-alert';
import { ApiStatusProvider } from '../../../../components/api-status/api-status.provider';
import { CollisionDetailsComponent } from '../../../collision-support/collision-details/collision-details';
import { ENV } from '../../../../environments/environment';
import { RequestServiceComponent } from '../../../car-list/components/request-service/request-service';
import { TripwireBreachPage } from '../../../../pages/tripwire-breach/tripwire-breach';
// import { CarSliderCardComponent } from '../car-slider-card/car-slider-card'

/**
 * Generated class for the DragCarDetailsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
import * as d3 from 'd3';

@Component({
  selector: 'drag-car-details',
  templateUrl: 'drag-car-details.html',
})
export class DragCarDetailsComponent implements OnInit {
  @Output() requestRaised = new EventEmitter();
  @Output()  tripwireDismissed = new EventEmitter();
  public statusMessages = {
    tripwire: {
      submit: 'Submitting Tripwire updates…',
      success: 'Tripwire successfully updated',
      failure: 'Cannot connect to device. Your Tripwire updates were reverted.',
    },
  };

  @Input('carDetailsItem') carDetailsItem: any;
  @ViewChild('chart') private chartContainer: ElementRef;
  @Input()
  set isShowDetail(value) {
    if (value) {
      console.log("loading card details from APIs");
      this.loadDataFromAPIs();
    }
  }


  private retryCount;
  private retryInterval;

  text: string;
  private margin: any = { top: 20, bottom: 20, left: 20, right: 20 };
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private colors: any;
  private xAxis: any;
  private yAxis: any;
  public alert: any;
  public collisiondetail: any;
  public weekData = [];
  public monthData = [];
  public yearData = [];
  public allData = [];
  public tripWireBreachDate;
  public milesDrivenLoading;
  public milesDrivenHasError;
  public tripwireData;
  public tripwireATS = false;
  public tripWireLoaded = false;
  public tripwirebreach = false;
  public stepId = 0;
  public chartoptions;
  public totalDistance = '';
  public distanceUnit = '';
  public displayDate = '';
  public hasData = false;
  public collisionHistory = [];
  public carhealth = [{
    cardefeact: 'P0607',
  },
  {
    cardefeact: 'Battery Replacement Needed',
  },
  {
    cardefeact: 'C6745',
  },
  {
    cardefeact: 'P0607',
  }];
  
  constructor(public carLocationHomeProvider: CarLocationHomeProvider, public sharedProvider: SharedProvider,
    public alertCtrl: AlertController, public modalCtrl: ModalController,
    public events: Events,
    public apiStatusProvider: ApiStatusProvider, public navCtrl: NavController, public navParams: NavParams
  ) {
    this.milesDrivenHasError = false;
    
    // this.weakchart(); 
  }

  ngOnInit() {
    this.tripWireBreachDate = (this.carDetailsItem && this.carDetailsItem.tripwireBreachData && this.carDetailsItem.tripwireBreachData.date) ? this.getMomentDateTime(this.carDetailsItem.tripwireBreachData.date) : '';
    // this.weekChart(0);
  }

  make_y_gridlines(y) {
    return d3.axisRight(y)
      .ticks(3)
  }

  returnArray(data) {
    let arr = [];
    arr = data;;
    return arr;
  }

  private nextWeekEnable = true;
  weekChart(dataDirection) {
    d3.selectAll('.d3-chart > *').remove();
    this.milesDrivenHasError = false;
    this.hasData = false;
    this.stepId = 0;
    this.totalDistance = '';
    this.distanceUnit = '';
    this.displayDate = '';
    this.carLocationHomeProvider.loadReportData(dataDirection, 1, this.carDetailsItem.assetId).then((res) => {
      this.weekData = this.returnArray(res);
      // this.weekData = this.carLocationHomeProvider.loadReportData(dataDirection, 1, this.carDetailsItem.assetId);
      if (this.weekData && this.weekData.length > 0) {
        this.hasData = true;
        this.nextWeekEnable = !moment(moment().format('YYYY-MM-DD')).isSame(this.weekData[0].responseDate, 'isoWeek');
        const element = this.chartContainer.nativeElement;
        const letterFrequencies = this.weekData;
        this.totalDistance = this.weekData[0].totalDistance;
        this.distanceUnit = this.weekData[0].distanceUnit;
        this.displayDate = this.weekData[0].dateRange;
        let paddingBars = 1;
        if (letterFrequencies.length > 10 && letterFrequencies.length < 25) {
          paddingBars = 2;
        } else if (letterFrequencies.length > 25) {
          paddingBars = 4;
        }
        const margin = { top: 20, right: 40, bottom: 40, left: 16 };
        const width = parseInt(d3.select(element).style("width")) - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
        const xScale = d3.scaleBand()
          .range([0, width])
          .round(true)
          .paddingInner(0.5); // space between bars (it's a ratio)
        //d3.set(gca,'XTick',[]);
        const yScale = d3.scaleLinear()
          .range([height, 0]);

        const xAxis = d3.axisBottom(xScale);
        //.scale(xScale);

        const yAxis = d3.axisRight(yScale)
          .ticks(2, '%');
        d3.selectAll('.d3-chart > *').remove();
        const svg = d3.select(element)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left}, ${margin.right})`);

        const tooltip = d3.select(element).append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);

        const line = d3.select(element).append('div')
          .attr('class', 'verticalLine')
          .style('opacity', 0);

        xScale
          .domain(letterFrequencies.map(d => d.letter));
        // .tickFormat(null);
        yScale
          .domain([0, d3.max(letterFrequencies, d => parseFloat(d.frequency))]);

        svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', `translate(0, ${height})`)
          .call(xAxis);

        svg.append("g")
          .attr("class", "grid")
          .attr("transform", `translate(${width},0)`)
          .call(this.make_y_gridlines(yScale)
            .tickSize(-width)
            .tickFormat(null)
          );

        // svg.append('g')
        //   .attr('class', 'y axis')
        //   .attr("transform", `translate(${width},0)`)
        //   .call(yAxis)
        //   .append('text')
        //   .attr('transform', 'rotate(-90)')
        //   .attr('y', 6);
        // .attr('dy', '.71em')

        svg.selectAll('.bar').data(letterFrequencies)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', d => xScale(d.letter))
          .attr('width', xScale.bandwidth())
          .attr('y', d => yScale(d.frequency))
          .attr('rx', 45)
          .attr('ry', 15)
          .attr('height', d => height - yScale(d.frequency))
          .on('mouseover', (d, i) => {
            let leftpadding = 50;
            if (i < paddingBars) {
              leftpadding = 20;
            } else if (letterFrequencies.length - i <= paddingBars) {
              leftpadding = 80;
            }
            console.log(xScale.bandwidth());
            let lineLeftPadding = xScale.bandwidth();
            if (lineLeftPadding % 2 == 1) {
              lineLeftPadding = lineLeftPadding - 1;
            }
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html(`<span class="tooltipdate">${d.tipDate} </span> <br/> <span class="fontColor">${d.frequency}  miles</span>`)
              .style("left", (d3.event.pageX - leftpadding) + "px")
              .style("top", "-13px");
            // .style('left', `${xScale(d.letter)+xScale.bandwidth()/2}px`)
            // .style('top', `-10px`);

            line.transition().duration(200).style('opacity', 0.9);
            line.style('left', `${xScale(d.letter) + margin.left + (lineLeftPadding) / 2}px`)
              .style('top', `28px`)
              .style('height', `${yScale(d.frequency) + 12}px`);

          })
          .on('mouseout', () => {
            tooltip.transition().duration(500).style('opacity', 0);
            line.transition().duration(500).style('opacity', 0);
          });
      } else {
        console.log("empty week data");
      }
      this.milesDrivenLoading = true;
    }, (err) => {
      this.milesDrivenHasError = true;
    })

  }

  private nextMonthEnable = true;
  monthChart(dataDirection) {
    d3.selectAll('.d3-chart > *').remove();
    this.hasData = false;
    this.stepId = 1;
    this.totalDistance = '';
    this.distanceUnit = '';
    this.displayDate = '';
    this.carLocationHomeProvider.loadReportData(dataDirection, 2, this.carDetailsItem.assetId).then((res) => {
      // this.monthData = this.carLocationHomeProvider.loadReportData(dataDirection, 2, this.carDetailsItem.assetId);
      this.monthData = this.returnArray(res);;
      if (this.monthData && this.monthData.length > 0) {
        this.hasData = true;
        this.nextMonthEnable = !moment(moment().format('YYYY-MM-DD')).isSame(this.monthData[0].responseDate, 'month');
        this.totalDistance = this.monthData[0].totalDistance;
        this.distanceUnit = this.monthData[0].distanceUnit;
        this.displayDate = this.monthData[0].dateRange;
        const element = this.chartContainer.nativeElement;
        const letterFrequencies = this.monthData;

        let paddingBars = 1;
        if (letterFrequencies.length > 10 && letterFrequencies.length < 25) {
          paddingBars = 2;
        } else if (letterFrequencies.length > 25) {
          paddingBars = 4;
        }


        const margin = { top: 20, right: 40, bottom: 40, left: 16 };
        const width = parseInt(d3.select(element).style("width")) - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const xScale = d3.scaleBand()
          .range([0, width])
          .round(true)
          .paddingInner(0.5); // space between bars (it's a ratio)
        //d3.set(gca,'XTick',[]);
        const yScale = d3.scaleLinear()
          .range([height, 0]);

        const xAxis = d3.axisBottom(xScale).tickFormat((d, i) => {
          if (d === 1) {
            return d;
          } else if (d % 5 === 0) {
            return d;
          }
        });

        // const xAxis = d3.axisBottom(xScale).ticks(5);
        //.ticks(5, '%');
        //.scale(xScale);
        const yAxis = d3.axisRight(yScale)
          .ticks(2, '%');

        d3.selectAll('.d3-chart > *').remove();
        const svg = d3.select(element).append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left}, ${margin.right})`);

        const tooltip = d3.select(element).append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);

        const line = d3.select(element).append('div')
          .attr('class', 'verticalLine')
          .style('opacity', 0);

        xScale
          .domain(letterFrequencies.map(d => d.letter));
        // .tickFormat(null);
        yScale
          .domain([0, d3.max(letterFrequencies, d => parseFloat(d.frequency))]);

        svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', `translate(0, ${height})`)
          .call(xAxis);

        svg.append("g")
          .attr("class", "grid")
          .attr("transform", `translate(${width},0)`)
          .call(this.make_y_gridlines(yScale)
            .tickSize(-width)
            .tickFormat(null)
          );

        // svg.append('g')
        //   .attr('class', 'y axis')
        //   .attr("transform", `translate(${width},0)`)
        //   .call(yAxis)
        //   .append('text')
        //   .attr('transform', 'rotate(-90)')
        //   .attr('y', 6);
        // .attr('dy', '.71em')

        svg.selectAll('.bar').data(letterFrequencies)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', d => xScale(d.letter))
          .attr('width', xScale.bandwidth())
          .attr('y', d => yScale(d.frequency))
          .attr('rx', 45)
          .attr('ry', 15)
          .attr('height', d => height - yScale(d.frequency))
          .on('mouseover', (d, i) => {
            let leftpadding = 50;
            if (i < paddingBars) {
              leftpadding = 20;
            } else if (letterFrequencies.length - i <= paddingBars) {
              leftpadding = 80;
            }
            let lineLeftPadding = xScale.bandwidth();
            if (lineLeftPadding % 2 == 1) {
              lineLeftPadding = lineLeftPadding - 1;
            }
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html(`<span class="tooltipdate">${d.tipDate} </span> <br/> <span class="fontColor">${d.frequency}  miles</span>`)
              .style("left", (d3.event.pageX - leftpadding) + "px")
              .style("top", "-13px");
            // .style('left', `${xScale(d.letter)+xScale.bandwidth()/2}px`)
            // .style('top', `-10px`);

            line.transition().duration(200).style('opacity', 0.9);
            line.style('left', `${xScale(d.letter) + margin.left + (lineLeftPadding) / 2}px`)
              .style('top', `28px`)
              .style('height', `${yScale(d.frequency) + 12}px`);

          })
          .on('mouseout', () => {
            tooltip.transition().duration(500).style('opacity', 0);
            line.transition().duration(500).style('opacity', 0);
          });
      } else {
      }
    }, (err) => {

    });
  }

  private nextYearEnable = true;
  yearChart(dataDirection) {
    d3.selectAll('.d3-chart > *').remove();
    this.hasData = false;
    this.stepId = 2;
    this.totalDistance = '';
    this.distanceUnit = '';
    this.displayDate = '';
    this.carLocationHomeProvider.loadReportData(dataDirection, 3, this.carDetailsItem.assetId).then((res) => {
      // this.yearData = this.carLocationHomeProvider.loadReportData(dataDirection, 3, this.carDetailsItem.assetId);
      this.yearData = this.returnArray(res);
      if (this.yearData && this.yearData.length > 0) {
        this.hasData = true;
        this.nextYearEnable = !moment().isSame(moment(this.yearData[0].responseDate, 'MM, YYYY'), 'year');
        this.totalDistance = this.yearData[0].totalDistance;
        this.distanceUnit = this.yearData[0].distanceUnit;
        this.displayDate = this.yearData[0].dateRange;
        const element = this.chartContainer.nativeElement;
        const letterFrequencies = this.yearData;

        let paddingBars = 1;
        if (letterFrequencies.length > 10 && letterFrequencies.length < 25) {
          paddingBars = 2;
        } else if (letterFrequencies.length > 25) {
          paddingBars = 4;
        }


        const margin = { top: 20, right: 40, bottom: 40, left: 16 };
        const width = parseInt(d3.select(element).style("width")) - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const xScale = d3.scaleBand()
          .range([0, width])
          .round(true)
          .paddingInner(0.5); // space between bars (it's a ratio)
        //d3.set(gca,'XTick',[]);
        const yScale = d3.scaleLinear()
          .range([height, 0]);

        const xAxis = d3.axisBottom(xScale);

        //.scale(xScale);

        const yAxis = d3.axisRight(yScale)
          .ticks(2, '%');

        d3.selectAll('.d3-chart > *').remove();
        const svg = d3.select(element).append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left}, ${margin.right})`);

        const tooltip = d3.select(element).append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);

        const line = d3.select(element).append('div')
          .attr('class', 'verticalLine')
          .style('opacity', 0);

        xScale
          .domain(letterFrequencies.map(d => d.letter));
        // .tickFormat(null);
        yScale
          .domain([0, d3.max(letterFrequencies, d => parseFloat(d.frequency))]);

        svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', `translate(0, ${height})`)
          .call(xAxis);

        svg.append("g")
          .attr("class", "grid")
          .attr("transform", `translate(${width},0)`)
          .call(this.make_y_gridlines(yScale)
            .tickSize(-width)
            .tickFormat(null)
          );


        svg.selectAll('.bar').data(letterFrequencies)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', d => xScale(d.letter))
          .attr('width', xScale.bandwidth())
          .attr('y', d => yScale(d.frequency))
          .attr('rx', 45)
          .attr('ry', 15)
          .attr('height', d => height - yScale(d.frequency))
          .on('mouseover', (d, i) => {
            let leftpadding = 50;
            if (i < paddingBars) {
              leftpadding = 20;
            } else if (letterFrequencies.length - i <= paddingBars) {
              leftpadding = 80;
            }
            let lineLeftPadding = xScale.bandwidth();
            if (lineLeftPadding % 2 == 1) {
              lineLeftPadding = lineLeftPadding - 1;
            }
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html(`<span class="tooltipdate">${d.tipDate} </span> <br/> <span class="fontColor">${d.frequency}  miles</span>`)
              .style("left", (d3.event.pageX - leftpadding) + "px")
              .style("top", "-13px");
            // .style('left', `${xScale(d.letter)+xScale.bandwidth()/2}px`)
            // .style('top', `-10px`);

            line.transition().duration(200).style('opacity', 0.9);
            line.style('left', `${xScale(d.letter) + margin.left + (lineLeftPadding) / 2}px`)
              .style('top', `28px`)
              .style('height', `${yScale(d.frequency) + 12}px`);

          })
          .on('mouseout', () => {
            tooltip.transition().duration(500).style('opacity', 0);
            line.transition().duration(500).style('opacity', 0);
          });
      } else {
      }
    }, (err) => {

    });
  }

  private nextAllYearEnable = true;
  allChart(dataDirection) {
  d3.selectAll('.d3-chart > *').remove();
    this.hasData = false;
    this.stepId = 3;
    this.totalDistance = '';
    this.distanceUnit = '';
    this.displayDate = '';
    this.carLocationHomeProvider.loadReportData(dataDirection, 4, this.carDetailsItem.assetId).then((res) => {
      // this.allData = this.carLocationHomeProvider.loadReportData(dataDirection, 4, this.carDetailsItem.assetId);
      this.allData = this.returnArray(res);
      if (this.allData && this.allData.length > 0) {
        this.hasData = true;
        this.nextAllYearEnable = !moment().isSame(moment(this.allData[this.allData.length - 1].responseDate, 'MM, YYYY'), 'year');
        this.totalDistance = this.allData[0].totalDistance;
        this.distanceUnit = this.allData[0].distanceUnit;
        this.displayDate = this.allData[0].dateRange;
        const element = this.chartContainer.nativeElement;
        const letterFrequencies = this.allData;
        let paddingBars = 1;
        if (letterFrequencies.length > 10 && letterFrequencies.length < 25) {
          paddingBars = 2;
        } else if (letterFrequencies.length > 25) {
          paddingBars = 4;
        }
        const margin = { top: 20, right: 40, bottom: 40, left: 16 };
        const width = parseInt(d3.select(element).style("width")) - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const xScale = d3.scaleBand()
          .range([0, width])
          .round(true)
          .paddingInner(0.5); // space between bars (it's a ratio)
        //d3.set(gca,'XTick',[]);
        const yScale = d3.scaleLinear()
          .range([height, 0]);

        const xAxis = d3.axisBottom(xScale).tickFormat((d, i) => {
          return d.split('-')[1] ? d.split('-')[1].substr(0, 1) : '';
        });
        //.scale(xScale);

        const yAxis = d3.axisRight(yScale)
          .ticks(2, '%');
        d3.selectAll('.d3-chart > *').remove();
        const svg = d3.select(element)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left}, ${margin.right})`);

        const tooltip = d3.select(element).append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);

        const line = d3.select(element).append('div')
          .attr('class', 'verticalLine')
          .style('opacity', 0);

        xScale
          .domain(letterFrequencies.map(d => d.letter));
        // .tickFormat(null);
        yScale
          .domain([0, d3.max(letterFrequencies, d => parseFloat(d.frequency))]);

        svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', `translate(0, ${height})`)
          .call(xAxis);

        svg.append("g")
          .attr("class", "grid")
          .attr("transform", `translate(${width},0)`)
          .call(this.make_y_gridlines(yScale)
            .tickSize(-width)
            .tickFormat(null)
          );

        // svg.append('g')
        //   .attr('class', 'y axis')
        //   .attr("transform", `translate(${width},0)`)
        //   .call(yAxis)
        //   .append('text')
        //   .attr('transform', 'rotate(-90)')
        //   .attr('y', 6);
        // .attr('dy', '.71em')

        svg.selectAll('.bar').data(letterFrequencies)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', d => xScale(d.letter))
          .attr('width', xScale.bandwidth())
          .attr('y', d => yScale(d.frequency))
          .attr('rx', 45)
          .attr('ry', 15)
          .attr('height', d => height - yScale(d.frequency))
          .on('mouseover', (d, i) => {
            let leftpadding = 50;
            if (i < paddingBars) {
              leftpadding = 20;
            } else if (letterFrequencies.length - i <= paddingBars) {
              leftpadding = 80;
            }
            let lineLeftPadding = xScale.bandwidth();
            if (lineLeftPadding % 2 == 1) {
              lineLeftPadding = lineLeftPadding - 1;
            }
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html(`<span class="tooltipdate">${d.tipDate} </span> <br/> <span class="fontColor">${d.frequency}  miles</span>`)
              .style("left", (d3.event.pageX - leftpadding) + "px")
              .style("top", "-13px");
            // .style('left', `${xScale(d.letter)+xScale.bandwidth()/2}px`)
            // .style('top', `-10px`);

            line.transition().duration(200).style('opacity', 0.9);
            line.style('left', `${xScale(d.letter) + margin.left + (lineLeftPadding) / 2}px`)
              .style('top', `28px`)
              .style('height', `${yScale(d.frequency) + 12}px`);

          })
          .on('mouseout', () => {
            tooltip.transition().duration(500).style('opacity', 0);
            line.transition().duration(500).style('opacity', 0);
          });
      } else {
      }
    }, (err) => {

    });
  }

  // API
  loadDataFromAPIs() {
    this.tripwireATS = false;
    this.tripWireLoaded = false;
    this.loadTripwireATS();
    this.collisionHistory = [];
    this.loadCollisionSummary();
    this.milesDrivenLoading = true;
    this.weekChart(0);
  }
  // API
  loadTripwireATS() {
    let assetId: number;
    assetId = this.carDetailsItem.assetId;
    this.carLocationHomeProvider.fetchTripwireATS(assetId).then((res) => {
      this.tripwireData = res;
      this.populateTripwireATS(this.getTripwireStatus(res));
    }, (err) => {
      console.log(err);
      this.sharedProvider.parseResponse(err);
    });
  }
  getTripwireStatus(res) {
    // tslint:disable-next-line:max-line-length
    return (res && res.response && res.response.results && res.response.results.length > 0 && res.response.results[0].asset && res.response.results[0].asset.tripwire && res.response.results[0].asset.tripwire.isSet) ? res.response.results[0].asset.tripwire.isSet : false;
  }
  populateTripwireATS(tripWireState) {
    this.tripWireLoaded = true;
    const assetId  = this.carDetailsItem ;
    this.events.publish('tripwireState', tripWireState , assetId);
    // this.events.publish('tripwireState', tripWireState);
    this.tripwireATS = tripWireState;
  }
  // API
  loadCollisionSummary() {
    let esnId: number;
    esnId = this.carDetailsItem.esnId;
    this.carLocationHomeProvider.fetchCollisionSummary(esnId).then((res) => {
      this.populateCollisionSummary(res);
    }, (err) => {
      this.sharedProvider.parseResponse(err);
    });
  }
  populateCollisionSummary(data) {
    let responseData = data.response.results;
    if (responseData.length == 0) {
    } else {
      let collision: any;
      this.collisionHistory = [];
      for (let i = 0; i < responseData.length; i++) {
        collision = { date: '', level: '', icnId: '' };
        collision.date = moment(responseData[i].crash.crashDate).format('MMMM D, YYYY');
        collision.level = this.maskCollisionSeverityCode(responseData[i].crash.severityCode);
        collision.icnId = responseData[i].crash.icnId;
        this.collisionHistory.push(collision);
      }
    }
  }
  maskCollisionSeverityCode(severityCode) {
    let maskedValue = '';
    switch (severityCode) {
      case 'NonCrash': maskedValue = 'Non Crash'; break;
      case 'VeryLight': maskedValue = 'Very Light Collision'; break;
      case 'Light': maskedValue = 'Light Collision'; break;
      case 'Moderate': maskedValue = 'Moderate Collision'; break;
      case 'Heavy': maskedValue = 'Heavy Collision'; break;
      case 'VeryHeavy': maskedValue = 'Very Heavy Collision'; break;
      default: maskedValue = severityCode; break;
    }
    return maskedValue;
  }

  collisiondetailscreen(history) {
    this.carLocationHomeProvider.getcollisiondetails(history.icnId).then((collisiondata) => {
      this.navCtrl.push(CollisionDetailsComponent, { data: collisiondata });
    }, (err) => {
      console.log(err);
      this.sharedProvider.parseResponse(err);
    });


  }

  toggleTripwireATS(status) {
    let action: any;    // enable/disable
    action = (status === undefined) ? this.tripwireATS : status;
    let assetId: any;
    assetId = this.carDetailsItem.assetId;
    const requestsObj = this.apiStatusProvider.getRequests();
    if (requestsObj.requestCount > 0) {
      this.populateTripwireATS(this.getTripwireStatus(this.tripwireData));
      return false;
    }
    // sending request to status component
    this.apiStatusProvider.addRequest(assetId, action, 'toggleTripwire', this.statusMessages.tripwire.submit);
    this.updateAPIRequestCount(false);
    this.carLocationHomeProvider.updateTripwireATS(action, assetId).then((res) => {
      this.retryCount = 0;
      this.retryInterval = setInterval(() => {
        if (this.retryCount >= ENV.CRITICAL_PRIORITY_API_RETRY) {
          clearInterval(this.retryInterval);
          this.cancelRequest();
          // TODO: cancel tripwire action API not available
          this.clearTrackTripwireATS(assetId);
        } else {
          this.callTrackTripwireATS(res);
        }
        this.retryCount = this.retryCount + 1;
      }, ENV.TRIPWIRE_API_RETRY_DELAY);
    }, (err) => {
      this.cancelRequest();
      console.log(err);
    });
  }
  clearTrackTripwireATS(assetId) {
    this.carLocationHomeProvider.clearTripwireATS(assetId).then(
      (resp) => {
        console.log(resp);
      },
      (error) => {
        console.log(error);
      });
  }
  cancelToggleTripwire() {
    clearInterval(this.retryInterval);
    this.cancelRequest();
  }
  cancelRequest() {
    this.populateTripwireATS(this.getTripwireStatus(this.tripwireData));
    // tslint:disable-next-line:max-line-length
    this.apiStatusProvider.updateRequest(this.carDetailsItem.assetId, !this.tripwireATS, 'toggleTripwire', this.statusMessages.tripwire.failure, 'failure');
    this.updateAPIRequestCount(false);
  }
  callTrackTripwireATS(updateRes) {
    this.carLocationHomeProvider.trackTripwireATS(this.getMessageUuid(updateRes)).then((resp) => {
      if (this.isTripwireCancelled(resp)) {
        this.cancelRequest();
      }
      if (this.isTripwireCompleted(resp)) {
        this.loadTripwireATS();
        // tslint:disable-next-line:max-line-length
        this.apiStatusProvider.updateRequest(this.carDetailsItem.assetId, !this.tripwireATS, 'toggleTripwire', this.statusMessages.tripwire.success, 'success');
        this.updateAPIRequestCount(true);
      }
    }, (error) => {
      console.log(error);
    });
  }
  getMessageUuid(data) {
    if (data && data.response && data.response.results[0] && data.response.results[0].deviceCommandEvent) {
      return data.response.results[0].deviceCommandEvent.messageUuid ? data.response.results[0].deviceCommandEvent.messageUuid : null;
    }
  }
  isTripwireCompleted(data) {
    // tslint:disable-next-line:max-line-length
    if (data && data.response && data.response.results[0] && data.response.results[0].deviceCommandEvent && data.response.results[0].deviceCommandEvent.status && data.response.results[0].deviceCommandEvent.status === 'COMPLETED') {
      clearInterval(this.retryInterval);
      return true;
    }
    return false;
  }
  isTripwireCancelled(data) {
    // tslint:disable-next-line:max-line-length
    if (data && data.response && data.response.results[0] && data.response.results[0].deviceCommandEvent && data.response.results[0].deviceCommandEvent.status && data.response.results[0].deviceCommandEvent.status === 'CANCELLED') {
      clearInterval(this.retryInterval);
      return true;
    }
    return false;
  }

  /************** Setting Global status for Tripwire API request ************/
  updateAPIRequestCount(updateRequired) {
    const requestsObj = this.apiStatusProvider.getRequests();
    // this.requestRaised.emit(requestsObj);
    this.requestRaised.emit({ requestsObj, updateRequired, status: this.tripwireATS });
  }
  /************** Setting Global status for Tripwire API request ************/
  presentCarhealthModal() {
    const profileModal = this.modalCtrl.create(TooltipAlertComponent, {
      image: 'assets/imgs/Car_Issue_Icon.png',
      title: 'Car Health',
      // tslint:disable-next-line:max-line-length
      message: 'Your LoJack device is capable of detecting hundreds of issues with your car. It can also alert you when your car’s battery needs to be replaced.'
    });
    profileModal.present();
  }
  presentModalTripWire() {
    const profileModal = this.modalCtrl.create(TooltipAlertComponent, {
      image: 'assets/svg/Tooltips_Tripwire.svg',
      title: 'Tripwire™ Early Warning',
      // tslint:disable-next-line:max-line-length
      message: 'Setting a Tripwire™ Early Warning will set a ¼ mile radius around the current location of your vehicle. If your vehicle moves over ¼ mile or leaves the area, we will send an early warning alert that your vehicle may have been stolen.'
    });
    profileModal.present();
  }

  closetripbreachdetails() {
    console.log('close');
    this.carDetailsItem.tripwireBreach = false;
    this.tripwireDismissed.emit(this.carDetailsItem);
  }

  tripwiresupport() {
    console.log('support');
    this.navCtrl.push(TripwireBreachPage, { tripWireData: this.carDetailsItem });
  }

  openServiceRequest() {
    // console.log('openServiceRequest');
    // console.log(this.carDetailsItem);
    const profileModal = this.modalCtrl.create(RequestServiceComponent, {
      assetName: {
        asset: {
          name: this.carDetailsItem.carName,
          id: this.carDetailsItem.assetId,
        },
      },
    });
    profileModal.present();
  }

  getMomentDateTime(date) {
    let newDate;
    if (moment(moment.unix(date / 1000)).isSame(moment(), 'day')) { // utc
      newDate = moment(moment.unix(date / 1000)).format('h:mm A'); // utc
    } else {
      newDate = moment(moment.unix(date / 1000)).format('h:mm A'); // date = moment.utc(date / 1000).format('MMM D, YYYY hh:mm A') // utc
    }
    return newDate; // .replace(/\b0/g, '');
  }

}

