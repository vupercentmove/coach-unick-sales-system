const STORAGE_KEY = 'coach-unick-customers'
const MAX_ANALYSES_PER_CUSTOMER = 20

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      const cleaned = cleanOldData(data)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
    }
  }
}

function cleanOldData(data) {
  const entries = Object.entries(data)
  if (entries.length === 0) return data

  entries.sort((a, b) => {
    const aLast = a[1].analyses?.[0]?.timestamp || 0
    const bLast = b[1].analyses?.[0]?.timestamp || 0
    return new Date(aLast) - new Date(bLast)
  })

  const oldest = entries[0]
  if (oldest[1].analyses) {
    oldest[1].analyses = oldest[1].analyses.slice(Math.floor(oldest[1].analyses.length / 2))
  }

  return Object.fromEntries(entries)
}

export function saveAnalysis(customerName, analysis) {
  const data = loadData()

  if (!data[customerName]) {
    data[customerName] = {
      name: customerName,
      stage: 'dm',
      analyses: []
    }
  }

  data[customerName].analyses.push({
    ...analysis,
    timestamp: new Date().toISOString()
  })

  if (data[customerName].analyses.length > MAX_ANALYSES_PER_CUSTOMER) {
    data[customerName].analyses = data[customerName].analyses.slice(-MAX_ANALYSES_PER_CUSTOMER)
  }

  saveData(data)
}

export function getCustomerAnalyses(customerName) {
  const data = loadData()
  return data[customerName]?.analyses || []
}

export function getAllCustomers() {
  const data = loadData()
  return Object.values(data).map(customer => ({
    name: customer.name,
    stage: customer.stage,
    analysisCount: customer.analyses?.length || 0,
    lastAnalysis: customer.analyses?.slice(-1)[0]?.timestamp || null
  })).sort((a, b) => new Date(b.lastAnalysis || 0) - new Date(a.lastAnalysis || 0))
}

export function deleteCustomer(customerName) {
  const data = loadData()
  delete data[customerName]
  saveData(data)
}

export function updateCustomerStage(customerName, stage) {
  const data = loadData()
  if (data[customerName]) {
    data[customerName].stage = stage
    saveData(data)
  }
}
