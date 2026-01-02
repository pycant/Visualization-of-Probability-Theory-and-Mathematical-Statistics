/**
 * AI Model Performance Correlation Analysis
 * Implements task 7.7 from the specification
 */

// Add AI Model Performance Analysis to Chapter3Visualizer
Chapter3Visualizer.prototype.initializeAIModelAnalysis = function() {
  // Initialize AI model performance analyzer with ML model data
  this.aiModelData = {
    currentModel: 'gpt', // Current selected model type
    currentTask: 'text-generation', // Current task type
    models: {
      gpt: { 
        name: 'GPT系列', 
        type: 'transformer',
        parameters: ['layers', 'attention_heads', 'hidden_size', 'learning_rate', 'batch_size'],
        metrics: ['perplexity', 'bleu_score', 'training_loss', 'inference_speed', 'memory_usage'],
        parameterRanges: {
          layers: [12, 96],
          attention_heads: [8, 128], 
          hidden_size: [768, 12288],
          learning_rate: [1e-5, 1e-3],
          batch_size: [8, 512]
        },
        metricRanges: {
          perplexity: [10, 100],
          bleu_score: [0.2, 0.9],
          training_loss: [0.5, 5.0],
          inference_speed: [10, 1000], // tokens/sec
          memory_usage: [2, 80] // GB
        },
        color: '#ff6b6b'
      },
      bert: {
        name: 'BERT系列',
        type: 'encoder',
        parameters: ['layers', 'attention_heads', 'hidden_size', 'learning_rate', 'dropout_rate'],
        metrics: ['accuracy', 'f1_score', 'training_time', 'inference_latency', 'model_size'],
        parameterRanges: {
          layers: [6, 24],
          attention_heads: [8, 16],
          hidden_size: [512, 1024],
          learning_rate: [1e-5, 5e-4],
          dropout_rate: [0.1, 0.3]
        },
        metricRanges: {
          accuracy: [0.7, 0.95],
          f1_score: [0.65, 0.92],
          training_time: [1, 48], // hours
          inference_latency: [5, 200], // ms
          model_size: [100, 1500] // MB
        },
        color: '#4ecdc4'
      },
      resnet: {
        name: 'ResNet系列',
        type: 'cnn',
        parameters: ['depth', 'width_multiplier', 'learning_rate', 'batch_size', 'weight_decay'],
        metrics: ['top1_accuracy', 'top5_accuracy', 'training_loss', 'flops', 'params_count'],
        parameterRanges: {
          depth: [18, 152],
          width_multiplier: [0.5, 2.0],
          learning_rate: [1e-4, 1e-1],
          batch_size: [16, 1024],
          weight_decay: [1e-5, 1e-3]
        },
        metricRanges: {
          top1_accuracy: [0.6, 0.85],
          top5_accuracy: [0.8, 0.95],
          training_loss: [0.1, 2.0],
          flops: [1e9, 1e11], // FLOPs
          params_count: [1e6, 1e8] // Parameters
        },
        color: '#45b7d1'
      }
    }
  };
  
  this.generateAIModelData();
  this.renderAIModelVisualizations();
};
// Generate AI model performance data with realistic correlations
Chapter3Visualizer.prototype.generateAIModelData = function() {
  const sampleSize = 800;
  const { currentModel } = this.aiModelData;
  const modelConfig = this.aiModelData.models[currentModel];
  
  if (!modelConfig) return;
  
  // Initialize data arrays
  this.aiModelData.parameterData = {};
  this.aiModelData.metricData = {};
  
  modelConfig.parameters.forEach(param => {
    this.aiModelData.parameterData[param] = [];
  });
  
  modelConfig.metrics.forEach(metric => {
    this.aiModelData.metricData[metric] = [];
  });
  
  // Generate correlated data based on model type
  for (let i = 0; i < sampleSize; i++) {
    // Base model complexity factor (affects all parameters and metrics)
    const complexityFactor = Math.random() * 0.6 + 0.4; // 0.4 to 1.0
    const optimizationLevel = Math.random() * 0.8 + 0.2; // 0.2 to 1.0
    const resourceConstraint = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
    
    // Generate parameters with realistic correlations
    this.generateModelParameters(modelConfig, complexityFactor, optimizationLevel, resourceConstraint, i);
    
    // Generate performance metrics based on parameters
    this.generatePerformanceMetrics(modelConfig, complexityFactor, optimizationLevel, resourceConstraint, i);
  }
  
  // Calculate correlation matrix
  this.calculateAIModelCorrelationMatrix();
  
  // Generate overfitting/underfitting patterns
  this.generateOverfittingPatterns();
  
  // Generate hyperparameter tuning data
  this.generateHyperparameterTuningData();
};
// Generate model parameters with realistic correlations
Chapter3Visualizer.prototype.generateModelParameters = function(modelConfig, complexityFactor, optimizationLevel, resourceConstraint, index) {
  const { parameters, parameterRanges } = modelConfig;
  
  parameters.forEach(param => {
    const [min, max] = parameterRanges[param];
    let value;
    
    switch (param) {
      case 'layers':
      case 'depth':
        // More layers = higher complexity
        value = min + (max - min) * complexityFactor + (Math.random() - 0.5) * (max - min) * 0.2;
        break;
        
      case 'attention_heads':
        // Attention heads correlate with model size
        value = min + (max - min) * complexityFactor * 0.8 + (Math.random() - 0.5) * (max - min) * 0.3;
        break;
        
      case 'hidden_size':
        // Hidden size strongly correlates with complexity
        value = min + (max - min) * complexityFactor * 0.9 + (Math.random() - 0.5) * (max - min) * 0.2;
        break;
        
      case 'learning_rate':
        // Learning rate inversely correlates with model size (larger models need smaller LR)
        value = max - (max - min) * complexityFactor * 0.6 + (Math.random() - 0.5) * (max - min) * 0.4;
        break;
        
      case 'batch_size':
        // Batch size constrained by resources
        value = min + (max - min) * resourceConstraint * 0.7 + (Math.random() - 0.5) * (max - min) * 0.3;
        break;
        
      case 'dropout_rate':
        // Dropout rate inversely correlates with optimization level
        value = max - (max - min) * optimizationLevel * 0.5 + (Math.random() - 0.5) * (max - min) * 0.3;
        break;
        
      case 'weight_decay':
        // Weight decay correlates with regularization needs
        value = min + (max - min) * (1 - optimizationLevel) * 0.6 + (Math.random() - 0.5) * (max - min) * 0.4;
        break;
        
      case 'width_multiplier':
        // Width multiplier correlates with complexity
        value = 0.5 + 1.5 * complexityFactor + (Math.random() - 0.5) * 0.4;
        break;
        
      default:
        value = min + (max - min) * Math.random();
    }
    
    this.aiModelData.parameterData[param].push(Math.max(min, Math.min(max, value)));
  });
};
// Generate performance metrics based on parameters
Chapter3Visualizer.prototype.generatePerformanceMetrics = function(modelConfig, complexityFactor, optimizationLevel, resourceConstraint, index) {
  const { metrics, metricRanges } = modelConfig;
  const { parameterData } = this.aiModelData;
  
  metrics.forEach(metric => {
    const [min, max] = metricRanges[metric];
    let value;
    
    // Get current parameter values for this sample
    const currentParams = {};
    modelConfig.parameters.forEach(param => {
      currentParams[param] = parameterData[param][index];
    });
    
    switch (metric) {
      case 'perplexity':
        // Lower perplexity is better, inversely correlates with model complexity and optimization
        value = max - (max - min) * (complexityFactor * 0.6 + optimizationLevel * 0.4) + (Math.random() - 0.5) * (max - min) * 0.3;
        break;
        
      case 'bleu_score':
      case 'accuracy':
      case 'f1_score':
      case 'top1_accuracy':
      case 'top5_accuracy':
        // Higher is better, correlates with complexity and optimization
        value = min + (max - min) * (complexityFactor * 0.5 + optimizationLevel * 0.5) + (Math.random() - 0.5) * (max - min) * 0.2;
        break;
        
      case 'training_loss':
        // Lower is better, inversely correlates with optimization
        value = max - (max - min) * optimizationLevel * 0.7 + (Math.random() - 0.5) * (max - min) * 0.3;
        break;
        
      case 'inference_speed':
        // Higher is better, inversely correlates with complexity
        value = max - (max - min) * complexityFactor * 0.8 + (Math.random() - 0.5) * (max - min) * 0.3;
        break;
        
      case 'memory_usage':
      case 'model_size':
      case 'params_count':
      case 'flops':
        // Resource usage correlates with complexity
        value = min + (max - min) * complexityFactor * 0.9 + (Math.random() - 0.5) * (max - min) * 0.2;
        break;
        
      case 'training_time':
      case 'inference_latency':
        // Time correlates with complexity, inversely with resources
        value = min + (max - min) * (complexityFactor * 0.7 + (1 - resourceConstraint) * 0.3) + (Math.random() - 0.5) * (max - min) * 0.3;
        break;
        
      default:
        value = min + (max - min) * Math.random();
    }
    
    this.aiModelData.metricData[metric].push(Math.max(min, Math.min(max, value)));
  });
};
// Calculate correlation matrix for AI model data
Chapter3Visualizer.prototype.calculateAIModelCorrelationMatrix = function() {
  const { parameterData, metricData } = this.aiModelData;
  const allData = { ...parameterData, ...metricData };
  const dataKeys = Object.keys(allData);
  
  const matrix = [];
  for (let i = 0; i < dataKeys.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < dataKeys.length; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else {
        const correlation = this.calculatePearsonCorrelation(
          allData[dataKeys[i]], 
          allData[dataKeys[j]]
        );
        matrix[i][j] = correlation;
      }
    }
  }
  
  this.aiModelData.correlationMatrix = matrix;
  this.aiModelData.dataKeys = dataKeys;
};

// Generate overfitting/underfitting patterns
Chapter3Visualizer.prototype.generateOverfittingPatterns = function() {
  const epochs = 100;
  this.aiModelData.trainingCurves = {
    epochs: Array.from({length: epochs}, (_, i) => i + 1),
    trainLoss: [],
    valLoss: [],
    trainAccuracy: [],
    valAccuracy: []
  };
  
  // Simulate different training scenarios
  const scenarios = ['normal', 'overfitting', 'underfitting'];
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  for (let epoch = 1; epoch <= epochs; epoch++) {
    let trainLoss, valLoss, trainAcc, valAcc;
    
    switch (scenario) {
      case 'overfitting':
        // Training loss decreases, validation loss increases after certain point
        trainLoss = 2.0 * Math.exp(-epoch / 20) + 0.1 + (Math.random() - 0.5) * 0.1;
        valLoss = epoch < 30 ? 
          2.0 * Math.exp(-epoch / 25) + 0.2 + (Math.random() - 0.5) * 0.1 :
          0.5 + (epoch - 30) * 0.02 + (Math.random() - 0.5) * 0.1;
        trainAcc = Math.min(0.95, 0.3 + (1 - Math.exp(-epoch / 15)) * 0.65 + (Math.random() - 0.5) * 0.02);
        valAcc = epoch < 30 ?
          0.3 + (1 - Math.exp(-epoch / 20)) * 0.5 + (Math.random() - 0.5) * 0.02 :
          Math.max(0.7, 0.8 - (epoch - 30) * 0.003 + (Math.random() - 0.5) * 0.02);
        break;
        
      case 'underfitting':
        // Both losses plateau at high values
        trainLoss = 1.5 * Math.exp(-epoch / 50) + 0.8 + (Math.random() - 0.5) * 0.1;
        valLoss = 1.5 * Math.exp(-epoch / 50) + 0.85 + (Math.random() - 0.5) * 0.1;
        trainAcc = Math.min(0.7, 0.3 + (1 - Math.exp(-epoch / 40)) * 0.4 + (Math.random() - 0.5) * 0.02);
        valAcc = Math.min(0.68, 0.3 + (1 - Math.exp(-epoch / 45)) * 0.38 + (Math.random() - 0.5) * 0.02);
        break;
        
      default: // normal
        // Both curves converge nicely
        trainLoss = 2.0 * Math.exp(-epoch / 25) + 0.15 + (Math.random() - 0.5) * 0.05;
        valLoss = 2.0 * Math.exp(-epoch / 30) + 0.2 + (Math.random() - 0.5) * 0.05;
        trainAcc = Math.min(0.92, 0.3 + (1 - Math.exp(-epoch / 20)) * 0.62 + (Math.random() - 0.5) * 0.01);
        valAcc = Math.min(0.88, 0.3 + (1 - Math.exp(-epoch / 25)) * 0.58 + (Math.random() - 0.5) * 0.01);
    }
    
    this.aiModelData.trainingCurves.trainLoss.push(Math.max(0.05, trainLoss));
    this.aiModelData.trainingCurves.valLoss.push(Math.max(0.05, valLoss));
    this.aiModelData.trainingCurves.trainAccuracy.push(Math.max(0.1, Math.min(1.0, trainAcc)));
    this.aiModelData.trainingCurves.valAccuracy.push(Math.max(0.1, Math.min(1.0, valAcc)));
  }
  
  this.aiModelData.fittingScenario = scenario;
};
// Generate hyperparameter tuning data
Chapter3Visualizer.prototype.generateHyperparameterTuningData = function() {
  const { currentModel } = this.aiModelData;
  const modelConfig = this.aiModelData.models[currentModel];
  
  // Generate hyperparameter optimization history
  this.aiModelData.hyperparameterTuning = {
    iterations: [],
    bestScores: [],
    parameterHistory: {},
    optimizationMethod: 'bayesian' // bayesian, grid, random
  };
  
  // Initialize parameter history
  modelConfig.parameters.forEach(param => {
    this.aiModelData.hyperparameterTuning.parameterHistory[param] = [];
  });
  
  const numIterations = 50;
  let bestScore = 0;
  
  for (let i = 0; i < numIterations; i++) {
    // Simulate hyperparameter optimization progress
    const iteration = i + 1;
    
    // Generate parameter values for this iteration
    modelConfig.parameters.forEach(param => {
      const [min, max] = modelConfig.parameterRanges[param];
      
      // Bayesian optimization tends to explore promising regions
      let value;
      if (i < 10) {
        // Initial random exploration
        value = min + (max - min) * Math.random();
      } else {
        // Exploitation around good regions with some exploration
        const explorationFactor = Math.max(0.1, 1 - i / numIterations);
        const targetValue = min + (max - min) * (0.3 + 0.4 * (i / numIterations));
        value = targetValue + (Math.random() - 0.5) * (max - min) * explorationFactor;
      }
      
      this.aiModelData.hyperparameterTuning.parameterHistory[param].push(
        Math.max(min, Math.min(max, value))
      );
    });
    
    // Calculate score based on parameter combination (simplified)
    const score = this.calculateHyperparameterScore(iteration - 1);
    bestScore = Math.max(bestScore, score);
    
    this.aiModelData.hyperparameterTuning.iterations.push(iteration);
    this.aiModelData.hyperparameterTuning.bestScores.push(bestScore);
  }
};

// Calculate hyperparameter score (simplified optimization objective)
Chapter3Visualizer.prototype.calculateHyperparameterScore = function(index) {
  const { currentModel } = this.aiModelData;
  const modelConfig = this.aiModelData.models[currentModel];
  const { parameterHistory } = this.aiModelData.hyperparameterTuning;
  
  // Get parameter values for this iteration
  const params = {};
  modelConfig.parameters.forEach(param => {
    params[param] = parameterHistory[param][index];
  });
  
  // Simplified scoring function (in reality this would be validation performance)
  let score = 0.5; // Base score
  
  // Model-specific scoring logic
  switch (currentModel) {
    case 'gpt':
      // For GPT: balance between model size and performance
      const layerScore = Math.min(1, params.layers / 48) * 0.3;
      const headScore = Math.min(1, params.attention_heads / 64) * 0.2;
      const lrScore = (1 - Math.abs(params.learning_rate - 2e-4) / 1e-3) * 0.3;
      const batchScore = Math.min(1, params.batch_size / 256) * 0.2;
      score = layerScore + headScore + lrScore + batchScore;
      break;
      
    case 'bert':
      // For BERT: optimize for downstream task performance
      const bertLayerScore = Math.min(1, params.layers / 12) * 0.25;
      const bertHeadScore = Math.min(1, params.attention_heads / 12) * 0.25;
      const bertLrScore = (1 - Math.abs(params.learning_rate - 2e-5) / 5e-4) * 0.3;
      const dropoutScore = (1 - Math.abs(params.dropout_rate - 0.1) / 0.2) * 0.2;
      score = bertLayerScore + bertHeadScore + bertLrScore + dropoutScore;
      break;
      
    case 'resnet':
      // For ResNet: balance accuracy and efficiency
      const depthScore = Math.min(1, params.depth / 101) * 0.3;
      const widthScore = Math.min(1, params.width_multiplier / 1.5) * 0.2;
      const resnetLrScore = (1 - Math.abs(params.learning_rate - 1e-2) / 1e-1) * 0.3;
      const wdScore = (1 - Math.abs(params.weight_decay - 1e-4) / 1e-3) * 0.2;
      score = depthScore + widthScore + resnetLrScore + wdScore;
      break;
  }
  
  // Add noise to simulate real optimization
  score += (Math.random() - 0.5) * 0.2;
  
  return Math.max(0, Math.min(1, score));
};
// Render all AI model visualizations
Chapter3Visualizer.prototype.renderAIModelVisualizations = function() {
  this.renderModelParameterCorrelation();
  this.renderPerformanceMetricsPlot();
  this.renderOverfittingDetection();
  this.renderHyperparameterOptimization();
  this.updateAIModelMetrics();
};

// Render model parameter correlation heatmap
Chapter3Visualizer.prototype.renderModelParameterCorrelation = function() {
  const canvas = document.getElementById('model-parameter-correlation');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  ctx.clearRect(0, 0, width, height);
  
  const { correlationMatrix, dataKeys } = this.aiModelData;
  if (!correlationMatrix || !dataKeys) return;
  
  const cellSize = Math.min(width, height) / dataKeys.length;
  const fontSize = Math.max(6, cellSize / 8);
  
  // Draw correlation matrix
  for (let i = 0; i < dataKeys.length; i++) {
    for (let j = 0; j < dataKeys.length; j++) {
      const corr = correlationMatrix[i][j];
      const x = j * cellSize;
      const y = i * cellSize;
      
      // Color based on correlation strength (AI theme)
      const intensity = Math.abs(corr);
      let color;
      if (intensity > 0.7) {
        color = corr > 0 ? '#ff6b6b' : '#4ecdc4'; // Strong correlation
      } else if (intensity > 0.4) {
        color = corr > 0 ? '#feca57' : '#48cae4'; // Medium correlation
      } else {
        color = '#95a5a6'; // Weak correlation
      }
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
      
      // Draw correlation value
      ctx.fillStyle = intensity > 0.5 ? 'white' : 'black';
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(corr.toFixed(2), x + cellSize/2, y + cellSize/2 + fontSize/3);
    }
  }
  
  // Draw labels (abbreviated for space)
  ctx.fillStyle = 'white';
  ctx.font = `${Math.max(8, fontSize)}px Arial`;
  ctx.textAlign = 'left';
  
  const labelMap = {
    layers: 'L', attention_heads: 'H', hidden_size: 'D', learning_rate: 'LR', 
    batch_size: 'BS', dropout_rate: 'DR', weight_decay: 'WD', depth: 'D',
    width_multiplier: 'W', perplexity: 'PPL', bleu_score: 'BLEU', 
    accuracy: 'ACC', f1_score: 'F1', training_loss: 'TL', inference_speed: 'IS',
    memory_usage: 'MEM', model_size: 'SIZE', training_time: 'TT',
    inference_latency: 'LAT', top1_accuracy: 'T1', top5_accuracy: 'T5',
    flops: 'FLOPS', params_count: 'PARAMS'
  };
  
  dataKeys.forEach((key, i) => {
    const label = labelMap[key] || key.substring(0, 3).toUpperCase();
    ctx.fillText(label, 2, i * cellSize + cellSize/2 + fontSize/3);
  });
};
// Render performance metrics scatter plot
Chapter3Visualizer.prototype.renderPerformanceMetricsPlot = function() {
  const canvas = document.getElementById('performance-metrics-plot');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  ctx.clearRect(0, 0, width, height);
  
  const { currentModel, metricData } = this.aiModelData;
  const modelConfig = this.aiModelData.models[currentModel];
  
  if (!modelConfig || !metricData) return;
  
  // Select two key metrics for scatter plot
  let xMetric, yMetric;
  switch (currentModel) {
    case 'gpt':
      xMetric = 'perplexity';
      yMetric = 'inference_speed';
      break;
    case 'bert':
      xMetric = 'accuracy';
      yMetric = 'inference_latency';
      break;
    case 'resnet':
      xMetric = 'top1_accuracy';
      yMetric = 'flops';
      break;
    default:
      xMetric = modelConfig.metrics[0];
      yMetric = modelConfig.metrics[1];
  }
  
  const xData = metricData[xMetric];
  const yData = metricData[yMetric];
  
  if (!xData || !yData) return;
  
  // Calculate ranges
  const xMin = Math.min(...xData);
  const xMax = Math.max(...xData);
  const yMin = Math.min(...yData);
  const yMax = Math.max(...yData);
  
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  
  // Draw scatter plot
  const margin = 30;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;
  
  // Draw points
  ctx.fillStyle = modelConfig.color + '80'; // Semi-transparent
  for (let i = 0; i < Math.min(xData.length, 300); i++) {
    const x = margin + ((xData[i] - xMin) / xRange) * plotWidth;
    const y = height - margin - ((yData[i] - yMin) / yRange) * plotHeight;
    
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  // Draw trend line (simplified linear regression)
  const correlation = this.calculatePearsonCorrelation(xData, yData);
  if (Math.abs(correlation) > 0.1) {
    const meanX = xData.reduce((sum, val) => sum + val, 0) / xData.length;
    const meanY = yData.reduce((sum, val) => sum + val, 0) / yData.length;
    
    const slope = correlation * (yRange / xRange);
    const intercept = meanY - slope * meanX;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const y1 = height - margin - ((intercept + slope * xMin - yMin) / yRange) * plotHeight;
    const y2 = height - margin - ((intercept + slope * xMax - yMin) / yRange) * plotHeight;
    
    ctx.moveTo(margin, y1);
    ctx.lineTo(margin + plotWidth, y2);
    ctx.stroke();
  }
  
  // Draw axes labels
  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(xMetric.replace('_', ' '), width / 2, height - 5);
  
  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yMetric.replace('_', ' '), 0, 0);
  ctx.restore();
  
  // Draw correlation coefficient
  ctx.textAlign = 'right';
  ctx.fillText(`r = ${correlation.toFixed(3)}`, width - 10, 20);
};
// Render overfitting detection chart
Chapter3Visualizer.prototype.renderOverfittingDetection = function() {
  const canvas = document.getElementById('overfitting-detection');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  ctx.clearRect(0, 0, width, height);
  
  const { trainingCurves, fittingScenario } = this.aiModelData;
  if (!trainingCurves) return;
  
  const margin = 30;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;
  
  const epochs = trainingCurves.epochs;
  const maxEpoch = Math.max(...epochs);
  
  // Draw training and validation loss curves
  const trainLoss = trainingCurves.trainLoss;
  const valLoss = trainingCurves.valLoss;
  
  const minLoss = Math.min(...trainLoss, ...valLoss);
  const maxLoss = Math.max(...trainLoss, ...valLoss);
  const lossRange = maxLoss - minLoss || 1;
  
  // Draw training loss
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let i = 0; i < epochs.length; i++) {
    const x = margin + (epochs[i] / maxEpoch) * plotWidth;
    const y = height - margin - ((trainLoss[i] - minLoss) / lossRange) * plotHeight;
    
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // Draw validation loss
  ctx.strokeStyle = '#4ecdc4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let i = 0; i < epochs.length; i++) {
    const x = margin + (epochs[i] / maxEpoch) * plotWidth;
    const y = height - margin - ((valLoss[i] - minLoss) / lossRange) * plotHeight;
    
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // Draw legend
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(10, 10, 15, 3);
  ctx.fillStyle = 'white';
  ctx.font = '10px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Training Loss', 30, 15);
  
  ctx.fillStyle = '#4ecdc4';
  ctx.fillRect(10, 25, 15, 3);
  ctx.fillText('Validation Loss', 30, 30);
  
  // Draw scenario indicator
  let scenarioColor;
  switch (fittingScenario) {
    case 'overfitting': scenarioColor = '#ff6b6b'; break;
    case 'underfitting': scenarioColor = '#feca57'; break;
    default: scenarioColor = '#4ecdc4';
  }
  
  ctx.fillStyle = scenarioColor;
  ctx.fillRect(width - 80, 10, 10, 10);
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  ctx.fillText(fittingScenario, width - 65, 20);
  
  // Draw axes labels
  ctx.textAlign = 'center';
  ctx.fillText('Epochs', width / 2, height - 5);
  
  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Loss', 0, 0);
  ctx.restore();
};
// Render hyperparameter optimization chart
Chapter3Visualizer.prototype.renderHyperparameterOptimization = function() {
  const canvas = document.getElementById('hyperparameter-optimization');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  ctx.clearRect(0, 0, width, height);
  
  const { hyperparameterTuning } = this.aiModelData;
  if (!hyperparameterTuning) return;
  
  const { iterations, bestScores } = hyperparameterTuning;
  
  const margin = 30;
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;
  
  const maxIteration = Math.max(...iterations);
  const minScore = Math.min(...bestScores);
  const maxScore = Math.max(...bestScores);
  const scoreRange = maxScore - minScore || 1;
  
  // Draw optimization curve
  ctx.strokeStyle = '#45b7d1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  
  for (let i = 0; i < iterations.length; i++) {
    const x = margin + (iterations[i] / maxIteration) * plotWidth;
    const y = height - margin - ((bestScores[i] - minScore) / scoreRange) * plotHeight;
    
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // Draw individual points
  ctx.fillStyle = '#45b7d1';
  for (let i = 0; i < iterations.length; i++) {
    const x = margin + (iterations[i] / maxIteration) * plotWidth;
    const y = height - margin - ((bestScores[i] - minScore) / scoreRange) * plotHeight;
    
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  // Draw convergence indicator
  const finalScore = bestScores[bestScores.length - 1];
  const convergenceThreshold = 0.01;
  const recentScores = bestScores.slice(-10);
  const isConverged = recentScores.every(score => Math.abs(score - finalScore) < convergenceThreshold);
  
  ctx.fillStyle = isConverged ? '#4ecdc4' : '#feca57';
  ctx.fillRect(width - 100, 10, 10, 10);
  ctx.fillStyle = 'white';
  ctx.font = '10px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(isConverged ? 'Converged' : 'Optimizing', width - 85, 20);
  
  // Draw best score
  ctx.textAlign = 'right';
  ctx.fillText(`Best: ${finalScore.toFixed(3)}`, width - 10, 35);
  
  // Draw axes labels
  ctx.textAlign = 'center';
  ctx.fillText('Iteration', width / 2, height - 5);
  
  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Best Score', 0, 0);
  ctx.restore();
};

// Update AI model metrics display
Chapter3Visualizer.prototype.updateAIModelMetrics = function() {
  const { currentModel, correlationMatrix, dataKeys, fittingScenario, hyperparameterTuning } = this.aiModelData;
  const modelConfig = this.aiModelData.models[currentModel];
  
  // Update model type display
  const modelTypeEl = document.getElementById('current-model-type');
  if (modelTypeEl) {
    modelTypeEl.textContent = modelConfig ? modelConfig.name : 'Unknown';
  }
  
  // Update correlation strength
  const correlationStrengthEl = document.getElementById('ai-correlation-strength');
  if (correlationStrengthEl && correlationMatrix) {
    let totalCorrelation = 0;
    let count = 0;
    
    for (let i = 0; i < correlationMatrix.length; i++) {
      for (let j = i + 1; j < correlationMatrix[i].length; j++) {
        totalCorrelation += Math.abs(correlationMatrix[i][j]);
        count++;
      }
    }
    
    const avgCorrelation = count > 0 ? totalCorrelation / count : 0;
    correlationStrengthEl.textContent = (avgCorrelation * 100).toFixed(1) + '%';
  }
  
  // Update fitting status
  const fittingStatusEl = document.getElementById('fitting-status');
  if (fittingStatusEl) {
    fittingStatusEl.textContent = fittingScenario || 'normal';
    fittingStatusEl.className = `text-lg ${
      fittingScenario === 'overfitting' ? 'text-red-400' :
      fittingScenario === 'underfitting' ? 'text-yellow-400' :
      'text-green-400'
    }`;
  }
  
  // Update optimization progress
  const optimizationProgressEl = document.getElementById('optimization-progress');
  if (optimizationProgressEl && hyperparameterTuning) {
    const progress = (hyperparameterTuning.iterations.length / 50) * 100;
    optimizationProgressEl.textContent = progress.toFixed(0) + '%';
  }
};