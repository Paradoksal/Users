async function håndterBruker(brukerId) {
    try {
        // Hent rad for den valgte brukeren
        const row = document.querySelector(`tr[data-bruker-id="${brukerId}"]`);
        if (!row) {
            alert('Brukeren finnes ikke.');
            return;
        }

        // Hent status på den valgte brukeren
        const statusCell = row.cells[1]; // Forutsatt at statusen er i den andre cellen
        const brukerStatus = statusCell.textContent.trim();

        if (brukerStatus === 'Ledig') {
            const ansatt = prompt('Vennligst skriv inn ditt navn:');
            if (ansatt) {
                const updateResponse = await fetch(`${BASE_URL}/oppdater`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        brukerId,
                        ansatt,
                        aksjon: 'ta'
                    })
                });

                if (updateResponse.ok) {
                    hentBrukere();
                } else {
                    alert('Noe gikk galt med å ta brukeren.');
                }
            }
        } else if (brukerStatus === 'Opptatt') {
            const ansattNavn = hentAnsattNavn(brukerId);
            const bekreftelse = confirm(`Er du sikker på at du vil frigjøre ${ansattNavn}? Husk at du ikke må frigjøre brukere som benyttes av andre.`);

            if (bekreftelse) {
                const updateResponse = await fetch(`${BASE_URL}/oppdater`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        brukerId,
                        aksjon: 'frigjør'
                    })
                });

                if (updateResponse.ok) {
                    hentBrukere();
                } else {
                    alert('Noe gikk galt med å frigjøre brukeren.');
                }
            }
        } else {
            alert('Ukjent status.');
        }
    } catch (error) {
        console.error('Feil ved oppdatering:', error);
        alert('Noe gikk galt med forespørselen.');
    }
}
