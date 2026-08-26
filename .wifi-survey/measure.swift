import CoreWLAN
import Foundation

let label = CommandLine.arguments.dropFirst().joined(separator: " ")
guard !label.isEmpty else {
    FileHandle.standardError.write(Data("Uso: swift measure.swift <ubicacion>\n".utf8))
    exit(2)
}

let client = CWWiFiClient.shared()
guard let interface = client.interface() ?? client.interface(withName: "en0") else {
    FileHandle.standardError.write(Data("No se encontro una interfaz Wi-Fi.\n".utf8))
    exit(1)
}

var rssi: [Int] = []
var noise: [Int] = []
var rate: [Double] = []

for _ in 0..<20 {
    rssi.append(interface.rssiValue())
    noise.append(interface.noiseMeasurement())
    rate.append(interface.transmitRate())
    usleep(100_000)
}

rssi.sort()
noise.sort()
rate.sort()

let medianRSSI = rssi[rssi.count / 2]
let medianNoise = noise[noise.count / 2]
let medianRate = rate[rate.count / 2]
let channel = interface.wlanChannel()?.channelNumber ?? 0
let widthCode = interface.wlanChannel()?.channelWidth.rawValue ?? 0
let widthMHz = [1: 20, 2: 40, 3: 80, 4: 160][widthCode] ?? 0
let timestamp = ISO8601DateFormatter().string(from: Date())
let formattedRate = String(format: "%.0f", medianRate)

print("\(timestamp),\(label),\(medianRSSI),\(medianNoise),\(medianRSSI - medianNoise),\(formattedRate),\(channel),\(widthMHz)")
