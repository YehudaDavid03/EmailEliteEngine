export function evaluateMathExpressions(emailMessage, lead) {
  return emailMessage.replace(/\[(.*?)\]/g, function(match, expr) {
      try {
          let result = !isNaN(expr) ? parseFloat(expr) : eval(expr.replace(/monthly_revenue/g, lead.monthly_revenue))
          return result.toLocaleString('en-US', {maximumFractionDigits: 2})
      } catch (e) {
          console.error("Error evaluating expression:", expr)
          return match
      }
  }).replace(/first_name|last_name|company_name/g, match => lead[match])
}