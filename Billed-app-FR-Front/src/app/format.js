// Fonction pour formater une date en français (ex: "4 Avr. 2024")
export const formatDate = (dateStr) => {

  // Création d'un objet Date à partir de la chaîne fournie
  const date = new Date(dateStr)

  // Extraction des parties de la date au format français
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)

  // Mise en majuscule de la première lettre du mois (ex: "Avr." au lieu de "avr.")
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)

  // Construction et retour de la date formatée (ex: "4 Avr. 2024")
  return `${parseInt(da)} ${month.substr(0,3)}. ${ye}`
}
 
// Fonction pour convertir le statut d'une facture en français
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente" // Si la facture est en attente
    case "accepted":
      return "Accepté" // Si la facture est acceptée
    case "refused":
      return "Refused" // Si la facture est refusée
  }
}