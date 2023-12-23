const pcap = require('pcap');
const ethInterface = 'eth0'
const pcapSession = pcap.createSession(ethInterface, 'tcp or udp');

const knownMac = new Set([
    "C4:7E:C0:FF:EE:42", "F1:ZZ:Y0:U2:PL:EZ"
])

pcapSession.on('packet', (rawPacket) => {
    const packet = pcap.decode.packet(rawPacket);

    if (packet.link_type === 'LINKTYPE_ETHERNET') {
        const ethernetPacket = packet.payload;
        const srcMac = ethernetPacket.shost.toString('hex').toUpperCase();

        if (knownMac.has(srcMac)) {
            console.log(`mac autentikacija uspesna! mac: ${srcMac}`)
        } else {
            console.log(`mac autentikacija neuspesna - nepoznata adresa! mac: ${srcMac}`)
        }
    }
});

console.log(`Slusam pakete na interfejsu ${ethInterface}`);

// Komanda za napad: sudo nping --interface eth0 --icmp --source-mac C4:7E:C0:FF:EE:42 --dest-mac ff:ff:ff:ff:ff:ff -c 5 localhost