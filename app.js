async function håndterBruker(brukerId) {
    try {
        // Hent rad for den valgte brukeren
        const row = document.querySelector(`tr[data-bruker-id="${brukerId}"]`);
        if (!row) {
            alert('Brukeren finnes ikke.');
            return;
        }

        // Hent status på den valgte brukeren
        const statusCell = row.cells[1];
        const brukerStatus = statusCell.textContent.trim();

        if (brukerStatus === 'Ledig') {
            // Sett brukeren til "opptatt" umiddelbart
            const statusOppdatert = await oppdaterStatus(brukerId, 'opptatt');
            if (!statusOppdatert) {
                alert('Noe gikk galt med å oppdatere statusen til opptatt.');
                return;
            }

            // Vis dialog for å få ansattens navn
            const ansatt = prompt('Vennligst skriv inn ditt navn:');
            if (ansatt) {
                const oppdatering = await oppdaterBrukerMedNavn(brukerId, ansatt);
                if (!oppdatering) {
                    // Hvis det er et problem med oppdateringen, sett brukeren tilbake til "ledig"
                    await oppdaterStatus(brukerId, 'ledig');
                    alert('Noe gikk galt med å oppdatere brukeren med ansattnavn.');
                }
            } else {
                // Hvis dialogen avbrytes, sett brukeren tilbake til "ledig"
                await oppdaterStatus(brukerId, 'ledig');
            }
        } else if (brukerStatus === 'Opptatt') {
            const ansattNavn = hentAnsattNavn(brukerId);
            const bekreftelse = confirm(`Er du sikker på at du vil frigjøre ${ansattNavn}? Husk at du ikke må frigjøre brukere som benyttes av andre.`);

            if (bekreftelse) {
                const oppdatering = await oppdaterStatus(brukerId, 'ledig');
                if (!oppdatering) {
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

async function oppdaterStatus(brukerId, nyStatus) {
    try {
        const response = await fetch(`${BASE_URL}/oppdaterStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ brukerId, status: nyStatus })
        });

        return response.ok;
    } catch (error) {
        console.error('Feil ved oppdatering av status:', error);
        return false;
    }
}

async function oppdaterBrukerMedNavn(brukerId, ansatt) {
    try {
        const response = await fetch(`${BASE_URL}/oppdater`, {
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

        return response.ok;
    } catch (error) {
        console.error('Feil ved oppdatering med ansattnavn:', error);
        return false;
    }
}
