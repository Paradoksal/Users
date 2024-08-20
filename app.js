// Hent brukere fra backend og oppdater tabellen
async function hentBrukere() {
    try {
        const response = await fetch('https://node-red.cloudflareno.de/api/brukere'); // Juster URL om nødvendig
        const brukere = await response.json();
        oppdaterBrukerListe(brukere);
    } catch (error) {
        console.error('Feil ved henting av brukere:', error);
        alert('Kunne ikke hente brukere.');
    }
}

// Oppdater tabellen med brukere
function oppdaterBrukerListe(brukere) {
    const brukerListe = document.getElementById('brukerListe');
    brukerListe.innerHTML = ''; // Rens tabellen

    brukere.forEach(bruker => {
        const row = document.createElement('tr');
        row.classList.add(bruker.status.toLowerCase());
        row.dataset.brukerId = bruker.id; // Legg til brukerID i dataset

        row.innerHTML = `
            <td>${bruker.navn}</td>
            <td>${bruker.status}</td>
            <td>${bruker.ansatt || 'Ingen'}</td>
            <td class="actions">
                <button onclick="taBruker(${bruker.id})">Ta Bruker</button>
                <button onclick="frigjorBruker(${bruker.id})">Frigjør Bruker</button>
            </td>
        `;

        brukerListe.appendChild(row);
    });
}

// Ta en bruker ved å skrive inn navnet ditt
async function taBruker(brukerId) {
    const row = document.querySelector(`tr[data-bruker-id="${brukerId}"]`);
    if (!row) {
        alert('Brukeren finnes ikke.');
        return;
    }

    const statusCell = row.cells[1]; // Forutsatt at statusen er i den andre cellen
    if (statusCell.textContent === 'Opptatt') {
        alert('Denne brukeren er allerede opptatt av en annen.');
        hentNesteLedigeBruker();
        return;
    }

    const ansatt = prompt('Vennligst skriv inn ditt navn:');
    if (ansatt) {
        try {
            const response = await fetch('https://node-red.cloudflareno.de/api/oppdater', { // Juster URL om nødvendig
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    brukerId: brukerId,
                    ansatt: ansatt,
                    aksjon: 'ta'
                })
            });

            if (response.ok) {
                hentBrukere();
            } else {
                alert('Noe gikk galt med å ta brukeren.');
            }
        } catch (error) {
            console.error('Feil ved oppdatering:', error);
            alert('Noe gikk galt med forespørselen.');
        }
    }
}

// Hent neste ledige bruker og prøv å ta den
async function hentNesteLedigeBruker() {
    try {
        const response = await fetch('https://node-red.cloudflareno.de/api/brukere'); // Juster URL om nødvendig
        const brukere = await response.json();

        // Finn den første ledige brukeren
        const ledigBruker = brukere.find(bruker => bruker.status === 'Ledig');
        if (ledigBruker) {
            taBruker(ledigBruker.id);
        } else {
            alert('Ingen ledige brukere tilgjengelige.');
        }
    } catch (error) {
        console.error('Feil ved henting av brukere:', error);
        alert('Kunne ikke hente brukere.');
    }
}

// Hent ansatt-navn fra tabellen basert på bruker-ID
function hentAnsattNavn(brukerId) {
    const row = document.querySelector(`tr[data-bruker-id="${brukerId}"]`);
    const ansattCell = row ? row.cells[2] : null;
    return ansattCell ? ansattCell.textContent : 'Ingen';
}

// Frigjør en bruker med en bekreftelsesdialog
async function frigjorBruker(brukerId) {
    const ansattNavn = hentAnsattNavn(brukerId);
    const bekreftelse = confirm(`Er du sikker på at du vil frigjøre ${ansattNavn}? Husk at du ikke må frigjøre brukere som benyttes av andre.`);

    if (bekreftelse) {
        try {
            const response = await fetch('https://node-red.cloudflareno.de/api/oppdater', { // Juster URL om nødvendig
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    brukerId: brukerId,
                    aksjon: 'frigjør'
                })
            });

            if (response.ok) {
                hentBrukere();
            } else {
                alert('Noe gikk galt med å frigjøre brukeren.');
            }
        } catch (error) {
            console.error('Feil ved oppdatering:', error);
            alert('Noe gikk galt med forespørselen.');
        }
    }
}

// Initialiser ved å hente brukere når siden lastes
hentBrukere();

// Oppdater tabellen automatisk hvert 10. sekund
setInterval(hentBrukere, 10000);
