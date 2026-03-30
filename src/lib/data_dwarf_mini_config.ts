// DWARF mini camera parameter configuration
// Extracted from actual device HTTP API (/shootingMode/getParamAndSetting)
// Device: DWARF mini, deviceId=4, FW 1.0.25.2
// Source: pcap capture iphone-capture4-modes.pcap (modeId=1 & modeId=2)
export const data_dwarf_mini_config = {
  code: 0,
  data: {
    cameras: [
      {
        fvHeight: 1.794,
        fvWidth: 3.188,
        id: 0,
        name: "Tele",
        previewHeight: 1080,
        previewWidth: 1920,
        supportParams: [
          {
            autoMode: 0,
            continueMode: {
              defaultValue: 5,
              max: 15,
              min: 0,
              step: 0,
              valueType: 1,
            },
            defaultModeIndex: 0,
            gearMode: {
              defaultValueIndex: 30,
              values: [
              {
                index: 0,
                name: "1/10000",
              },
              {
                index: 3,
                name: "1/8000",
              },
              {
                index: 6,
                name: "1/6400",
              },
              {
                index: 9,
                name: "1/5000",
              },
              {
                index: 12,
                name: "1/4000",
              },
              {
                index: 15,
                name: "1/3200",
              },
              {
                index: 18,
                name: "1/2500",
              },
              {
                index: 21,
                name: "1/2000",
              },
              {
                index: 24,
                name: "1/1600",
              },
              {
                index: 27,
                name: "1/1250",
              },
              {
                index: 30,
                name: "1/1000",
              },
              {
                index: 33,
                name: "1/800",
              },
              {
                index: 36,
                name: "1/640",
              },
              {
                index: 39,
                name: "1/500",
              },
              {
                index: 42,
                name: "1/400",
              },
              {
                index: 45,
                name: "1/320",
              },
              {
                index: 48,
                name: "1/250",
              },
              {
                index: 51,
                name: "1/200",
              },
              {
                index: 54,
                name: "1/160",
              },
              {
                index: 57,
                name: "1/125",
              },
              {
                index: 60,
                name: "1/100",
              },
              {
                index: 63,
                name: "1/80",
              },
              {
                index: 66,
                name: "1/60",
              },
              {
                index: 69,
                name: "1/50",
              },
              {
                index: 72,
                name: "1/40",
              },
              {
                index: 75,
                name: "1/30",
              },
              {
                index: 78,
                name: "1/25",
              },
              {
                index: 81,
                name: "1/20",
              },
              {
                index: 84,
                name: "1/15",
              },
              {
                index: 87,
                name: "1/13",
              },
              {
                index: 90,
                name: "1/10",
              },
              {
                index: 93,
                name: "1/8",
              },
              {
                index: 96,
                name: "1/6",
              },
              {
                index: 99,
                name: "1/5",
              },
              {
                index: 102,
                name: "1/4",
              },
              {
                index: 105,
                name: "1/3",
              },
              {
                index: 108,
                name: "0.4",
              },
              {
                index: 111,
                name: "0.5",
              },
              {
                index: 114,
                name: "0.6",
              },
              {
                index: 117,
                name: "0.8",
              },
              {
                index: 120,
                name: "1",
              },
              {
                index: 123,
                name: "1.3",
              },
              {
                index: 126,
                name: "1.6",
              },
              {
                index: 129,
                name: "2",
              },
              {
                index: 132,
                name: "2.5",
              },
              {
                index: 135,
                name: "3.2",
              },
              {
                index: 138,
                name: "4",
              },
              {
                index: 141,
                name: "5",
              },
              {
                index: 144,
                name: "6",
              },
              {
                index: 147,
                name: "8",
              },
              {
                index: 150,
                name: "10",
              },
              {
                index: 153,
                name: "13",
              },
              {
                index: 156,
                name: "15",
              },
              {
                index: 159,
                name: "30",
              },
              {
                index: 160,
                name: "45",
              },
              {
                index: 162,
                name: "60",
              },
              {
                index: 163,
                name: "90",
              },
              {
                index: 165,
                name: "120",
              },
              {
                index: 168,
                name: "180",
              },
              ],
            },
            hasAuto: 0,
            id: 0,
            name: "Exposure",
            supportMode: [0, 1],
          },
          {
            autoMode: 0,
            continueMode: {
              defaultValue: 60,
              max: 240,
              min: 0,
              step: 1,
              valueType: 1,
            },
            defaultModeIndex: 0,
            gearMode: {
              defaultValueIndex: 60,
              values: [
              {
                index: 0,
                name: "0",
              },
              {
                index: 2,
                name: "2",
              },
              {
                index: 5,
                name: "5",
              },
              {
                index: 10,
                name: "10",
              },
              {
                index: 20,
                name: "20",
              },
              {
                index: 30,
                name: "30",
              },
              {
                index: 40,
                name: "40",
              },
              {
                index: 50,
                name: "50",
              },
              {
                index: 60,
                name: "60",
              },
              {
                index: 70,
                name: "70",
              },
              {
                index: 80,
                name: "80",
              },
              {
                index: 90,
                name: "90",
              },
              {
                index: 100,
                name: "100",
              },
              {
                index: 110,
                name: "110",
              },
              {
                index: 120,
                name: "120",
              },
              {
                index: 130,
                name: "130",
              },
              {
                index: 140,
                name: "140",
              },
              {
                index: 150,
                name: "150",
              },
              {
                index: 160,
                name: "160",
              },
              {
                index: 170,
                name: "170",
              },
              {
                index: 180,
                name: "180",
              },
              {
                index: 190,
                name: "190",
              },
              {
                index: 200,
                name: "200",
              },
              {
                index: 210,
                name: "210",
              },
              {
                index: 220,
                name: "220",
              },
              {
                index: 230,
                name: "230",
              },
              {
                index: 240,
                name: "240",
              },
              ],
            },
            hasAuto: 0,
            id: 1,
            name: "Gain",
            supportMode: [0, 1],
          },
          {
            autoMode: 0,
            continueMode: {
              defaultValue: 2800,
              max: 7500,
              min: 2800,
              step: 100,
              valueType: 1,
            },
            defaultModeIndex: 0,
            gearMode: {
              defaultValueIndex: 24,
              values: [
              {
                index: 0,
                name: "2800",
              },
              {
                index: 1,
                name: "2900",
              },
              {
                index: 2,
                name: "3000",
              },
              {
                index: 3,
                name: "3100",
              },
              {
                index: 4,
                name: "3200",
              },
              {
                index: 5,
                name: "3300",
              },
              {
                index: 6,
                name: "3400",
              },
              {
                index: 7,
                name: "3500",
              },
              {
                index: 8,
                name: "3600",
              },
              {
                index: 9,
                name: "3700",
              },
              {
                index: 10,
                name: "3800",
              },
              {
                index: 11,
                name: "3900",
              },
              {
                index: 12,
                name: "4000",
              },
              {
                index: 13,
                name: "4100",
              },
              {
                index: 14,
                name: "4200",
              },
              {
                index: 15,
                name: "4300",
              },
              {
                index: 16,
                name: "4400",
              },
              {
                index: 17,
                name: "4500",
              },
              {
                index: 18,
                name: "4600",
              },
              {
                index: 19,
                name: "4700",
              },
              {
                index: 20,
                name: "4800",
              },
              {
                index: 21,
                name: "4900",
              },
              {
                index: 22,
                name: "5000",
              },
              {
                index: 23,
                name: "5100",
              },
              {
                index: 24,
                name: "5200",
              },
              {
                index: 25,
                name: "5300",
              },
              {
                index: 26,
                name: "5400",
              },
              {
                index: 27,
                name: "5500",
              },
              {
                index: 28,
                name: "5600",
              },
              {
                index: 29,
                name: "5700",
              },
              {
                index: 30,
                name: "5800",
              },
              {
                index: 31,
                name: "5900",
              },
              {
                index: 32,
                name: "6000",
              },
              {
                index: 33,
                name: "6100",
              },
              {
                index: 34,
                name: "6200",
              },
              {
                index: 35,
                name: "6300",
              },
              {
                index: 36,
                name: "6400",
              },
              {
                index: 37,
                name: "6500",
              },
              {
                index: 38,
                name: "6600",
              },
              {
                index: 39,
                name: "6700",
              },
              {
                index: 40,
                name: "6800",
              },
              {
                index: 41,
                name: "6900",
              },
              {
                index: 42,
                name: "7000",
              },
              {
                index: 43,
                name: "7100",
              },
              {
                index: 44,
                name: "7200",
              },
              {
                index: 45,
                name: "7300",
              },
              {
                index: 46,
                name: "7400",
              },
              {
                index: 47,
                name: "7500",
              },
              ],
            },
            hasAuto: 0,
            id: 2,
            name: "WB",
            supportMode: [0, 1, 2],
          },
          {
            autoMode: 0,
            continueMode: {
              defaultValue: 0,
              max: 1,
              min: 0,
              step: 1,
              valueType: 1,
            },
            defaultModeIndex: 0,
            gearMode: {
              defaultValueIndex: 0,
              values: [
              {
                index: 0,
                name: "VIS Filter",
              },
              {
                index: 1,
                name: "Duo-Band Filter",
              },
              ],
            },
            hasAuto: 0,
            id: 8,
            name: "IR",
            supportMode: [0],
          },
        ],
      },
      {
        fvHeight: 1.794,
        fvWidth: 3.188,
        id: 1,
        name: "Wide",
        previewHeight: 1080,
        previewWidth: 1920,
        supportParams: [
          {
            autoMode: 0,
            continueMode: {
              defaultValue: 5,
              max: 15,
              min: 0,
              step: 0,
              valueType: 1,
            },
            defaultModeIndex: 0,
            gearMode: {
              defaultValueIndex: 30,
              values: [
              {
                index: 0,
                name: "1/10000",
              },
              {
                index: 3,
                name: "1/8000",
              },
              {
                index: 6,
                name: "1/6400",
              },
              {
                index: 9,
                name: "1/5000",
              },
              {
                index: 12,
                name: "1/4000",
              },
              {
                index: 15,
                name: "1/3200",
              },
              {
                index: 18,
                name: "1/2500",
              },
              {
                index: 21,
                name: "1/2000",
              },
              {
                index: 24,
                name: "1/1600",
              },
              {
                index: 27,
                name: "1/1250",
              },
              {
                index: 30,
                name: "1/1000",
              },
              {
                index: 33,
                name: "1/800",
              },
              {
                index: 36,
                name: "1/640",
              },
              {
                index: 39,
                name: "1/500",
              },
              {
                index: 42,
                name: "1/400",
              },
              {
                index: 45,
                name: "1/320",
              },
              {
                index: 48,
                name: "1/250",
              },
              {
                index: 51,
                name: "1/200",
              },
              {
                index: 54,
                name: "1/160",
              },
              {
                index: 57,
                name: "1/125",
              },
              {
                index: 60,
                name: "1/100",
              },
              {
                index: 63,
                name: "1/80",
              },
              {
                index: 66,
                name: "1/60",
              },
              {
                index: 69,
                name: "1/50",
              },
              {
                index: 72,
                name: "1/40",
              },
              {
                index: 75,
                name: "1/30",
              },
              {
                index: 78,
                name: "1/25",
              },
              {
                index: 81,
                name: "1/20",
              },
              {
                index: 84,
                name: "1/15",
              },
              {
                index: 87,
                name: "1/13",
              },
              {
                index: 90,
                name: "1/10",
              },
              {
                index: 93,
                name: "1/8",
              },
              {
                index: 96,
                name: "1/6",
              },
              {
                index: 99,
                name: "1/5",
              },
              {
                index: 102,
                name: "1/4",
              },
              {
                index: 105,
                name: "1/3",
              },
              {
                index: 108,
                name: "0.4",
              },
              {
                index: 111,
                name: "0.5",
              },
              {
                index: 114,
                name: "0.6",
              },
              {
                index: 117,
                name: "0.8",
              },
              {
                index: 120,
                name: "1",
              },
              {
                index: 123,
                name: "1.3",
              },
              {
                index: 126,
                name: "1.6",
              },
              {
                index: 129,
                name: "2",
              },
              {
                index: 132,
                name: "2.5",
              },
              {
                index: 135,
                name: "3.2",
              },
              {
                index: 138,
                name: "4",
              },
              {
                index: 141,
                name: "5",
              },
              {
                index: 144,
                name: "6",
              },
              {
                index: 147,
                name: "8",
              },
              {
                index: 150,
                name: "10",
              },
              {
                index: 153,
                name: "13",
              },
              {
                index: 156,
                name: "15",
              },
              {
                index: 159,
                name: "30",
              },
              ],
            },
            hasAuto: 0,
            id: 0,
            name: "Exposure",
            supportMode: [0, 1],
          },
          {
            autoMode: 0,
            continueMode: {
              defaultValue: 60,
              max: 2500,
              min: 40,
              step: 1,
              valueType: 1,
            },
            defaultModeIndex: 0,
            gearMode: {
              defaultValueIndex: 60,
              values: [
              {
                index: 40,
                name: "40",
              },
              {
                index: 50,
                name: "50",
              },
              {
                index: 60,
                name: "60",
              },
              {
                index: 70,
                name: "70",
              },
              {
                index: 80,
                name: "80",
              },
              {
                index: 90,
                name: "90",
              },
              {
                index: 100,
                name: "100",
              },
              {
                index: 110,
                name: "110",
              },
              {
                index: 120,
                name: "120",
              },
              {
                index: 130,
                name: "130",
              },
              {
                index: 140,
                name: "140",
              },
              {
                index: 150,
                name: "150",
              },
              {
                index: 160,
                name: "160",
              },
              {
                index: 170,
                name: "170",
              },
              {
                index: 180,
                name: "180",
              },
              {
                index: 190,
                name: "190",
              },
              {
                index: 200,
                name: "200",
              },
              {
                index: 210,
                name: "210",
              },
              {
                index: 220,
                name: "220",
              },
              {
                index: 230,
                name: "230",
              },
              {
                index: 240,
                name: "240",
              },
              {
                index: 250,
                name: "250",
              },
              {
                index: 300,
                name: "300",
              },
              {
                index: 350,
                name: "350",
              },
              {
                index: 400,
                name: "400",
              },
              {
                index: 450,
                name: "450",
              },
              {
                index: 500,
                name: "500",
              },
              {
                index: 550,
                name: "550",
              },
              {
                index: 600,
                name: "600",
              },
              {
                index: 650,
                name: "650",
              },
              {
                index: 700,
                name: "700",
              },
              {
                index: 1000,
                name: "1000",
              },
              {
                index: 1300,
                name: "1300",
              },
              {
                index: 1600,
                name: "1600",
              },
              {
                index: 1900,
                name: "1900",
              },
              {
                index: 2200,
                name: "2200",
              },
              {
                index: 2500,
                name: "2500",
              },
              ],
            },
            hasAuto: 0,
            id: 1,
            name: "Gain",
            supportMode: [0, 1],
          },
          {
            autoMode: 0,
            continueMode: {
              defaultValue: 2800,
              max: 7500,
              min: 2800,
              step: 100,
              valueType: 1,
            },
            defaultModeIndex: 0,
            gearMode: {
              defaultValueIndex: 24,
              values: [
              {
                index: 0,
                name: "2800",
              },
              {
                index: 1,
                name: "2900",
              },
              {
                index: 2,
                name: "3000",
              },
              {
                index: 3,
                name: "3100",
              },
              {
                index: 4,
                name: "3200",
              },
              {
                index: 5,
                name: "3300",
              },
              {
                index: 6,
                name: "3400",
              },
              {
                index: 7,
                name: "3500",
              },
              {
                index: 8,
                name: "3600",
              },
              {
                index: 9,
                name: "3700",
              },
              {
                index: 10,
                name: "3800",
              },
              {
                index: 11,
                name: "3900",
              },
              {
                index: 12,
                name: "4000",
              },
              {
                index: 13,
                name: "4100",
              },
              {
                index: 14,
                name: "4200",
              },
              {
                index: 15,
                name: "4300",
              },
              {
                index: 16,
                name: "4400",
              },
              {
                index: 17,
                name: "4500",
              },
              {
                index: 18,
                name: "4600",
              },
              {
                index: 19,
                name: "4700",
              },
              {
                index: 20,
                name: "4800",
              },
              {
                index: 21,
                name: "4900",
              },
              {
                index: 22,
                name: "5000",
              },
              {
                index: 23,
                name: "5100",
              },
              {
                index: 24,
                name: "5200",
              },
              {
                index: 25,
                name: "5300",
              },
              {
                index: 26,
                name: "5400",
              },
              {
                index: 27,
                name: "5500",
              },
              {
                index: 28,
                name: "5600",
              },
              {
                index: 29,
                name: "5700",
              },
              {
                index: 30,
                name: "5800",
              },
              {
                index: 31,
                name: "5900",
              },
              {
                index: 32,
                name: "6000",
              },
              {
                index: 33,
                name: "6100",
              },
              {
                index: 34,
                name: "6200",
              },
              {
                index: 35,
                name: "6300",
              },
              {
                index: 36,
                name: "6400",
              },
              {
                index: 37,
                name: "6500",
              },
              {
                index: 38,
                name: "6600",
              },
              {
                index: 39,
                name: "6700",
              },
              {
                index: 40,
                name: "6800",
              },
              {
                index: 41,
                name: "6900",
              },
              {
                index: 42,
                name: "7000",
              },
              {
                index: 43,
                name: "7100",
              },
              {
                index: 44,
                name: "7200",
              },
              {
                index: 45,
                name: "7300",
              },
              {
                index: 46,
                name: "7400",
              },
              {
                index: 47,
                name: "7500",
              },
              ],
            },
            hasAuto: 0,
            id: 2,
            name: "WB",
            supportMode: [0, 1, 2],
          },
        ],
      },
    ],
    featureParams: [
      {
        gearMode: {
          defaultValueIndex: 0,
          values: [
            {
              index: 0,
              name: "4k",
            },
            {
              index: 1,
              name: "2k",
            },
          ],
        },
        id: 0,
        name: "Astro binning",
      },
      {
        autoMode: 0,
        continueMode: {
          defaultValue: 0,
          max: 0,
          min: 0,
          step: 0,
          valueType: 0,
        },
        defaultModeIndex: 0,
        hasAuto: 0,
        id: 1,
        name: "Astro Exp Mode",
        supportMode: [0],
      },
      {
        gearMode: {
          defaultValueIndex: 0,
          values: [
            {
              index: 0,
              name: "FITS",
            },
            {
              index: 1,
              name: "TIFF",
            },
          ],
        },
        id: 2,
        name: "Astro img format",
      },
      {
        gearMode: {
          defaultValueIndex: 0,
          values: [
              {
                index: 0,
                name: "3",
              },
              {
                index: 1,
                name: "5",
              },
              {
                index: 2,
                name: "10",
              },
              {
                index: 3,
                name: "15",
              },
              {
                index: 4,
                name: "20",
              },
              {
                index: 5,
                name: "30",
              },
              {
                index: 6,
                name: "40",
              },
              {
                index: 7,
                name: "50",
              },
              {
                index: 8,
                name: "60",
              },
              {
                index: 9,
                name: "70",
              },
              {
                index: 10,
                name: "80",
              },
              {
                index: 11,
                name: "90",
              },
              {
                index: 12,
                name: "100",
              },
              {
                index: 13,
                name: "120",
              },
              {
                index: 14,
                name: "150",
              },
              {
                index: 15,
                name: "200",
              },
              {
                index: 16,
                name: "300",
              },
              {
                index: 17,
                name: "400",
              },
              {
                index: 18,
                name: "500",
              },
              {
                index: 19,
                name: "600",
              },
              {
                index: 20,
                name: "700",
              },
              {
                index: 21,
                name: "900",
              },
              {
                index: 22,
                name: "1000",
              },
          ],
        },
        id: 3,
        name: "Count Burst",
      },
      {
        gearMode: {
          defaultValueIndex: 0,
          values: [
              {
                index: 0,
                name: "0.5 s",
              },
              {
                index: 1,
                name: "1 s",
              },
              {
                index: 2,
                name: "2 s",
              },
              {
                index: 3,
                name: "3 s",
              },
              {
                index: 4,
                name: "4 s",
              },
              {
                index: 5,
                name: "5 s",
              },
              {
                index: 6,
                name: "8 s",
              },
              {
                index: 7,
                name: "10 s",
              },
              {
                index: 8,
                name: "15 s",
              },
              {
                index: 9,
                name: "20 s",
              },
              {
                index: 10,
                name: "25 s",
              },
              {
                index: 11,
                name: "30 s",
              },
              {
                index: 12,
                name: "60 s",
              },
          ],
        },
        id: 4,
        name: "Interval TimeLapse",
      },
      {
        gearMode: {
          defaultValueIndex: 0,
          values: [
              {
                index: 0,
                name: "∞",
              },
              {
                index: 1,
                name: "2 min",
              },
              {
                index: 2,
                name: "5 min",
              },
              {
                index: 3,
                name: "8 min",
              },
              {
                index: 4,
                name: "10 min",
              },
              {
                index: 5,
                name: "20 min",
              },
              {
                index: 6,
                name: "30 min",
              },
              {
                index: 7,
                name: "40 min",
              },
              {
                index: 8,
                name: "50 min",
              },
              {
                index: 9,
                name: "60 min",
              },
              {
                index: 10,
                name: "120 min",
              },
              {
                index: 11,
                name: "180 min",
              },
              {
                index: 12,
                name: "240 min",
              },
              {
                index: 13,
                name: "300 min",
              },
          ],
        },
        id: 5,
        name: "Total Time TimeLapse",
      },
      {
        autoMode: 0,
        continueMode: {
          defaultValue: 0,
          max: 0,
          min: 0,
          step: 0,
          valueType: 0,
        },
        defaultModeIndex: 0,
        hasAuto: 0,
        id: 6,
        name: "Wide Exp Mode",
        supportMode: [0],
      },
      {
        autoMode: 0,
        continueMode: {
          defaultValue: 0,
          max: 0,
          min: 0,
          step: 0,
          valueType: 0,
        },
        defaultModeIndex: 0,
        hasAuto: 0,
        id: 7,
        name: "Tele Exp Mode",
        supportMode: [0],
      },
      {
        gearMode: {
          defaultValueIndex: 0,
          values: [
            {
              index: 0,
              name: "Stacked",
            },
            {
              index: 1,
              name: "Single",
            },
          ],
        },
        id: 8,
        name: "Astro save format",
      },
      {
        gearMode: {
          defaultValueIndex: 0,
          values: [
              {
                index: 0,
                name: "Off",
              },
              {
                index: 1,
                name: "1 s",
              },
              {
                index: 2,
                name: "2 s",
              },
              {
                index: 3,
                name: "3 s",
              },
              {
                index: 4,
                name: "4 s",
              },
              {
                index: 5,
                name: "5 s",
              },
              {
                index: 6,
                name: "8 s",
              },
              {
                index: 7,
                name: "10 s",
              },
              {
                index: 8,
                name: "15 s",
              },
              {
                index: 9,
                name: "20 s",
              },
              {
                index: 10,
                name: "25 s",
              },
              {
                index: 11,
                name: "30 s",
              },
              {
                index: 12,
                name: "60 s",
              },
          ],
        },
        id: 9,
        name: "Interval Burst",
      },
      {
        gearMode: {
          defaultValueIndex: 0,
          values: [
            {
              index: 0,
              name: "4K",
            },
            {
              index: 1,
              name: "2K",
            },
          ],
        },
        id: 10,
        name: "Photo Resolution",
      },
      {
        gearMode: {
          defaultValueIndex: 0,
          values: [
            {
              index: 0,
              name: "30",
            },
            {
              index: 1,
              name: "60",
            },
          ],
        },
        id: 11,
        name: "Video Frame Rate",
      },
      {
        gearMode: {
          defaultValueIndex: 0,
          values: [
            {
              index: 0,
              name: "2K",
            },
          ],
        },
        id: 12,
        name: "Video Resolution",
      },
      {
        gearMode: {
          defaultValueIndex: 0,
          values: [
            {
              index: 0,
              name: "30",
            },
          ],
        },
        id: 13,
        name: "Timelapse Frame Rate",
      },
      {
        gearMode: {
          defaultValueIndex: 1,
          values: [
            {
              index: 0,
              name: "ON",
            },
            {
              index: 1,
              name: "OFF",
            },
          ],
        },
        id: 14,
        name: "Timelapse Acceleration",
      },
    ],
  },
};
