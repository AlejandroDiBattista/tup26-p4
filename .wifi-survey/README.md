# Relevamiento Wi-Fi

Formato de cada muestra:

`fecha,ubicacion,RSSI_dBm,ruido_dBm,SNR_dB,tasa_PHY_Mbps,canal,ancho_MHz`

La muestra se toma con:

```sh
swift .wifi-survey/measure.swift "nombre de la ubicacion"
```

Referencias prácticas para RSSI:

- `-30` a `-50 dBm`: excelente
- `-51` a `-60 dBm`: muy bueno
- `-61` a `-67 dBm`: bueno para videollamadas
- `-68` a `-72 dBm`: límite; conviene mejorar
- menor que `-72 dBm`: zona problemática
