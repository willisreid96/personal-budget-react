import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import * as d3 from 'd3';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function HomePage() {
    const [budgetData, setBudgetData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch data from backend using Axios
        const fetchBudgetData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/budget');
                setBudgetData(response.data);
                setLoading(false);
                
                // Create D3.js chart after data is loaded
                setTimeout(() => createD3Chart(response.data), 100);
            } catch (error) {
                console.error('Error fetching budget data:', error);
                setLoading(false);
            }
        };

        fetchBudgetData();
    }, []);

    // Create D3.js donut chart
    const createD3Chart = (data) => {
        // Clear any existing chart
        d3.select('#d3-donut').selectAll('*').remove();

        const width = 400;
        const height = 400;
        const margin = 40;
        const radius = Math.min(width, height) / 2 - margin;

        // Create SVG
        const svg = d3.select('#d3-donut')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('display', 'block')
            .style('margin', '0 auto')
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        // Color scale - using the same colors as Chart.js for consistency
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#FF6384'
        ];
        
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.title))
            .range(colors);

        // Create pie layout
        const pie = d3.pie()
            .value(d => d.budget)
            .sort(null);

        // Create arc generator
        const arc = d3.arc()
            .innerRadius(radius * 0.5) 
            .outerRadius(radius);

        // Create arcs
        const arcs = svg.selectAll('.arc')
            .data(pie(data))
            .enter().append('g')
            .attr('class', 'arc');

        // Add paths
        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.title))
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

        // Add labels outside the donut
        arcs.append('text')
            .attr('transform', d => {
                const [x, y] = arc.centroid(d);
                return `translate(${x * 1.4}, ${y * 1.4})`;
            })
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '11px')
            .style('font-weight', 'bold')
            .style('fill', '#333')
            .text(d => d.data.title);

        console.log('D3 chart created successfully');
    };

    // Prepare data for Chart.js
    const chartData = {
        labels: budgetData.map(item => item.title),
        datasets: [
            {
                data: budgetData.map(item => item.budget),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#FF6384'
                ],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Budget Distribution (Chart.js)',
            },
        },
    };

    if (loading) {
        return <div>Loading budget data...</div>;
    }

    return (
        <main className="center" id="main">
            <div className="page-area">
                <article>
                    <h1>Stay on track</h1>
                    <p>
                        Do you know where you are spending your money? If you really stop to track it down,
                        you would get surprised! Proper budget management depends on real data... and this
                        app will help you with that!
                    </p>
                </article>

                <article>
                    <h1>Alerts</h1>
                    <p>
                        What if your clothing budget ended? You will get an alert. The goal is to never go over the budget.
                    </p>
                </article>

                <article>
                    <h1>Results</h1>
                    <p>
                        People who stick to a financial plan, budgeting every expense, get out of debt faster!
                        Also, they to live happier lives... since they expend without guilt or fear... 
                        because they know it is all good and accounted for.
                    </p>
                </article>

                <article>
                    <h1>Free</h1>
                    <p>
                        This app is free!!! And you are the only one holding your data!
                    </p>
                </article>

                <article>
                    <h1>Chart.js Chart</h1>
                    <div style={{ width: '400px', height: '400px', margin: '0 auto' }}>
                        <Pie data={chartData} options={chartOptions} />
                    </div>
                </article>

                <article>
                    <h1>D3.js Chart</h1>
                    <div 
                        id="d3-donut"
                        style={{ 
                            width: '400px', 
                            height: '400px', 
                            margin: '0 auto'
                        }}
                    ></div>
                </article>
            </div>
        </main>
    );
}

export default HomePage;