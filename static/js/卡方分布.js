// 获取DOM元素
const dfSlider = document.getElementById('df');
const dfValue = document.getElementById('df-value');
const xMaxSlider = document.getElementById('x-max');
const xMaxValue = document.getElementById('x-max-value');

// 同步滑块和数字输入框的值
dfSlider.addEventListener('input', () => {
    dfValue.value = dfSlider.value;
    updateCharts();
});

dfValue.addEventListener('input', () => {
    let value = Math.min(20, Math.max(1, parseInt(dfValue.value) || 1));
    dfSlider.value = value;
    dfValue.value = value;
    updateCharts();
});

xMaxSlider.addEventListener('input', () => {
    xMaxValue.value = xMaxSlider.value;
    updateCharts();
});

xMaxValue.addEventListener('input', () => {
    let value = Math.min(50, Math.max(10, parseInt(xMaxValue.value) || 20));
    xMaxSlider.value = value;
    xMaxValue.value = value;
    updateCharts();
});

// 初始化图表
const pdfCtx = document.getElementById('pdf-chart').getContext('2d');
const cdfCtx = document.getElementById('cdf-chart').getContext('2d');
const compareCtx = document.getElementById('compare-chart').getContext('2d');
const sampleCtx = document.getElementById('sample-chart').getContext('2d');

let pdfChart, cdfChart, compareChart, sampleChart;

// 生成卡方分布数据
function generateChiSquareData(df, maxX, points = 100) {
    const data = [];
    const step = maxX / points;
    
    for (let x = 0; x <= maxX; x += step) {
        const pdf = jStat.chisquare.pdf(x, df);
        const cdf = jStat.chisquare.cdf(x, df);
        data.push({x, pdf, cdf});
    }
    
    return data;
}

// 生成不同自由度的比较数据
function generateCompareData(maxX) {
    const dfs = [1, 2, 4, 6, 8];
    const datasets = [];
    const colors = ['#4cc9f0', '#4895ef', '#4361ee', '#3f37c9', '#560bad'];
    
    dfs.forEach((df, i) => {
        const data = [];
        const step = maxX / 100;
        
        for (let x = 0; x <= maxX; x += step) {
            const pdf = jStat.chisquare.pdf(x, df);
            data.push({x, y: pdf});
        }
        
        datasets.push({
            label: `k = ${df}`,
            data: data,
            borderColor: colors[i],
            backgroundColor: colors[i] + '20',
            borderWidth: 2,
            fill: false,
            tension: 0.1
        });
    });
    
    return datasets;
}

// 生成随机抽样数据
function generateSampleData(df, sampleSize = 1000, bins = 20) {
    const samples = [];
    for (let i = 0; i < sampleSize; i++) {
        samples.push(jStat.chisquare.sample(df));
    }
    
    const maxX = Math.max(...samples);
    const binSize = maxX / bins;
    const histogram = new Array(bins).fill(0);
    
    samples.forEach(sample => {
        const binIndex = Math.min(Math.floor(sample / binSize), bins - 1);
        histogram[binIndex]++;
    });
    
    // 归一化直方图（使其高度与PDF可比）
    const normalizedHistogram = histogram.map(count => count / (sampleSize * binSize));
    
    // 生成理论PDF数据
    const theoryData = [];
    for (let i = 0; i < bins; i++) {
        const x = (i + 0.5) * binSize;
        theoryData.push(jStat.chisquare.pdf(x, df));
    }
    
    return {
        bins,
        binSize,
        histogram: normalizedHistogram,
        theoryData,
        labels: Array.from({length: bins}, (_, i) => ((i + 0.5) * binSize).toFixed(1))
    };
}

// 创建PDF图表
function createPdfChart() {
    if (pdfChart) pdfChart.destroy();
    
    const df = parseInt(dfSlider.value);
    const maxX = parseInt(xMaxSlider.value);
    const data = generateChiSquareData(df, maxX);
    
    pdfChart = new Chart(pdfCtx, {
        type: 'line',
        data: {
            datasets: [{
                label: `卡方分布 PDF (k=${df})`,
                data: data.map(d => ({x: d.x, y: d.pdf})),
                borderColor: '#f72585',
                backgroundColor: '#f7258533',
                borderWidth: 3,
                pointRadius: 0,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'x',
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '概率密度',
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ddd'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `f(${context.parsed.x.toFixed(2)}) = ${context.parsed.y.toFixed(4)}`;
                        }
                    }
                }
            }
        }
    });
}

// 创建CDF图表
function createCdfChart() {
    if (cdfChart) cdfChart.destroy();
    
    const df = parseInt(dfSlider.value);
    const maxX = parseInt(xMaxSlider.value);
    const data = generateChiSquareData(df, maxX);
    
    cdfChart = new Chart(cdfCtx, {
        type: 'line',
        data: {
            datasets: [{
                label: `卡方分布 CDF (k=${df})`,
                data: data.map(d => ({x: d.x, y: d.cdf})),
                borderColor: '#4cc9f0',
                backgroundColor: '#4cc9f033',
                borderWidth: 3,
                pointRadius: 0,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'x',
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '累积概率',
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    min: 0,
                    max: 1
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ddd'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `F(${context.parsed.x.toFixed(2)}) = ${context.parsed.y.toFixed(4)}`;
                        }
                    }
                }
            }
        }
    });
}

// 创建比较图表
function createCompareChart() {
    if (compareChart) compareChart.destroy();
    
    const maxX = parseInt(xMaxSlider.value);
    const datasets = generateCompareData(maxX);
    
    compareChart = new Chart(compareCtx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'x',
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '概率密度',
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ddd'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `${context.dataset.label}: f(${context.parsed.x.toFixed(2)}) = ${context.parsed.y.toFixed(4)}`;
                        }
                    }
                }
            }
        }
    });
}

// 创建抽样图表
function createSampleChart() {
    if (sampleChart) sampleChart.destroy();
    
    const df = parseInt(dfSlider.value);
    const maxX = parseInt(xMaxSlider.value);
    const sampleData = generateSampleData(df, 1000, 20);
    
    sampleChart = new Chart(sampleCtx, {
        type: 'bar',
        data: {
            labels: sampleData.labels,
            datasets: [
                {
                    label: '随机抽样',
                    data: sampleData.histogram,
                    backgroundColor: '#4361ee77',
                    borderColor: '#4361ee',
                    borderWidth: 1
                },
                {
                    label: '理论分布',
                    data: sampleData.theoryData,
                    type: 'line',
                    borderColor: '#f72585',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'x',
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '密度',
                        color: '#aaa'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ddd'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            if (context.datasetIndex === 0) {
                                return `抽样密度: ${context.parsed.y.toFixed(4)}`;
                            } else {
                                return `理论密度: ${context.parsed.y.toFixed(4)}`;
                            }
                        }
                    }
                }
            }
        }
    });
}

// 更新所有图表
function updateCharts() {
    createPdfChart();
    createCdfChart();
    createCompareChart();
    createSampleChart();
}

// 初始化图表
updateCharts();