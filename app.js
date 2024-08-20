async function håndterBruker(brukerId) {
    try {
        const row = document.querySelector(`tr[data-bruker-id="${brukerId}"]`);
        if (!row) {
            alert('Brukeren finnes ikke.');
            return;
        }

        const statusCell = row.cells[1];
        const brukerStatus = statusCell.textContent.trim();

        if (brukerStatus === 'Ledig') {
            const ansatt = prompt('Vennligst skriv inn ditt navn:');
            if (ansatt) {
                await oppdaterBruker(brukerId, ansatt, 'ta');
            }
        } else if (brukerStatus === 'Opptatt') {
            const ansattNavn = hentAnsattNavn(brukerId);
            const bekreftelse = confirm(`Er du sikker på at du vil frigjøre ${ansattNavn}? Husk at du ikke må frigjøre brukere som benyttes av andre.`);

            if (bekreftelse) {
                await oppdaterBruker(brukerId, null, 'frigjør');
            }
        } else {
            alert('Ukjent status.');
        }
    } catch (error) {
        console.error('Feil ved oppdatering:', error);
        alert('Noe gikk galt med forespørselen.');
    }
}

async function oppdaterBruker(brukerId, ansatt, aksjon) {
    try {
        const response = await fetch(`${BASE_URL}/oppdater`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ brukerId, ansatt, aksjon })
        });

        if (response.ok) {
            hentBrukere();
        } else {
            alert(`Noe gikk galt med å ${aksjon} brukeren.`);
        }
    } catch (error) {
        console.error('Feil ved oppdatering:', error);
        alert('Noe gikk galt med forespørselen.');
    }
}
