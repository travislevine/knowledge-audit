/* The Embedded Systems and IoT course plan. Week pages, the overview page and the progress summary all read from this. */
window.SYLLABUS = {
  "id": "embedded",
  "title": "Embedded Systems and IoT",
  "hoursPerWeek": 8,
  "lede": "A hands-on course on building connected devices with the hardware you have: an ESP32, an Arduino, a Raspberry Pi and a soil moisture sensor. Microcontrollers and GPIO, sensors and buses, MQTT and IoT pipelines, then control, power and reliability. Weekly mini-projects are tested on your laptop; three larger projects build up to an automatic plant-watering system.",
  "how": [
    [
      "Lessons (about 3 h)",
      "Read each lesson, answer the checkpoints, try the widget and follow the linked resource. Mark each lesson complete as you go."
    ],
    [
      "Projects (4–7 h)",
      "A mini-project with tests in <code>embedded/projects/week-NN-*</code>, then (weeks 2–4) a larger build on real hardware: plant monitor, MQTT pipeline, watering system."
    ],
    [
      "Quiz and reflection (30 min)",
      "Finish with the 10-question quiz (70% to pass), then rate yourself and reflect."
    ]
  ],
  "notesPlaceholder": "e.g. Tests pass. Sensor calibrated at dry 3020 / wet 1290. LED status works; OLED not tried yet.",
  "weeks": [
    {
      "n": 1,
      "slug": "week-01",
      "status": "ready",
      "title": "Microcontrollers, GPIO and timing",
      "summary": "What a microcontroller is, how digital pins work electrically, why timing and interrupts matter, and how state machines keep firmware simple.",
      "objectives": [
        {
          "id": "w1-o1",
          "text": "Choose between a microcontroller (Arduino, ESP32) and a single-board computer (Raspberry Pi) for a task"
        },
        {
          "id": "w1-o2",
          "text": "Wire digital inputs and outputs safely: voltage levels, pull-ups and current-limiting resistors"
        },
        {
          "id": "w1-o3",
          "text": "Write non-blocking code with timers and interrupts, and debounce a button"
        },
        {
          "id": "w1-o4",
          "text": "Design firmware as a finite state machine"
        }
      ],
      "lessons": [
        {
          "id": "w1-l1",
          "title": "Microcontrollers vs single-board computers",
          "minutes": 35
        },
        {
          "id": "w1-l2",
          "title": "Digital pins and basic electronics",
          "minutes": 45
        },
        {
          "id": "w1-l3",
          "title": "Timing, interrupts and debouncing",
          "minutes": 45
        },
        {
          "id": "w1-l4",
          "title": "State machines",
          "minutes": 40
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Mini-project: buttons that behave",
        "path": "embedded/projects/week-01-buttons"
      },
      "quiz": "embedded-01-quiz",
      "quizQuestions": 10
    },
    {
      "n": 2,
      "slug": "week-02",
      "status": "ready",
      "title": "Sensors, actuators and buses",
      "summary": "Reading the analog world with ADCs, driving actuators with PWM and transistors, talking to chips over UART, I2C and SPI, and cleaning up noisy sensor data.",
      "objectives": [
        {
          "id": "w2-o1",
          "text": "Convert ADC readings to voltages and calibrated physical units"
        },
        {
          "id": "w2-o2",
          "text": "Use PWM to control brightness, speed and servos, and switch loads with transistors and relays"
        },
        {
          "id": "w2-o3",
          "text": "Compare UART, I2C and SPI, and read a sensor's datasheet and registers"
        },
        {
          "id": "w2-o4",
          "text": "Filter noisy readings with median and exponential moving average filters"
        }
      ],
      "lessons": [
        {
          "id": "w2-l1",
          "title": "Analog sensors and the ADC",
          "minutes": 40
        },
        {
          "id": "w2-l2",
          "title": "PWM and driving actuators",
          "minutes": 40
        },
        {
          "id": "w2-l3",
          "title": "UART, I2C and SPI",
          "minutes": 45
        },
        {
          "id": "w2-l4",
          "title": "Taming noisy data",
          "minutes": 35
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Mini-project: sensor toolkit · Project 1: ESP32 plant monitor",
        "path": "embedded/projects/week-02-sensors and embedded/projects/project-1-plant-monitor"
      },
      "quiz": "embedded-02-quiz",
      "quizQuestions": 10
    },
    {
      "n": 3,
      "slug": "week-03",
      "status": "ready",
      "title": "IoT connectivity and MQTT",
      "summary": "Choosing a wireless technology, publish/subscribe messaging with MQTT, designing data pipelines from device to dashboard, and running a fleet of devices securely.",
      "objectives": [
        {
          "id": "w3-o1",
          "text": "Choose between Wi-Fi, Bluetooth LE, LoRa, Zigbee and cellular for a use case"
        },
        {
          "id": "w3-o2",
          "text": "Explain MQTT: brokers, topics and wildcards, QoS, retained messages and last will"
        },
        {
          "id": "w3-o3",
          "text": "Design a device-to-dashboard pipeline that tolerates network outages"
        },
        {
          "id": "w3-o4",
          "text": "Apply security basics to devices: unique credentials, TLS and safe updates"
        }
      ],
      "lessons": [
        {
          "id": "w3-l1",
          "title": "Choosing a radio",
          "minutes": 35
        },
        {
          "id": "w3-l2",
          "title": "MQTT",
          "minutes": 50
        },
        {
          "id": "w3-l3",
          "title": "From device to dashboard",
          "minutes": 40
        },
        {
          "id": "w3-l4",
          "title": "Fleets and security",
          "minutes": 40
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Mini-project: MQTT toolkit · Project 2: Raspberry Pi MQTT pipeline",
        "path": "embedded/projects/week-03-mqtt and embedded/projects/project-2-mqtt-pipeline"
      },
      "quiz": "embedded-03-quiz",
      "quizQuestions": 10
    },
    {
      "n": 4,
      "slug": "week-04",
      "status": "ready",
      "title": "Control, power and reliable devices",
      "summary": "Closing the loop: on/off and PID control, running on batteries, watchdogs and fail-safes, and taking a prototype towards a dependable device. Ends with the automatic watering system.",
      "objectives": [
        {
          "id": "w4-o1",
          "text": "Implement on/off control with hysteresis, and explain proportional, integral and derivative control"
        },
        {
          "id": "w4-o2",
          "text": "Estimate battery life from a duty cycle, and use sleep modes to extend it"
        },
        {
          "id": "w4-o3",
          "text": "Make a device fail safe with watchdogs, timeouts, limits and sensor validation"
        },
        {
          "id": "w4-o4",
          "text": "Test firmware logic without hardware, and plan the step from prototype to product"
        }
      ],
      "lessons": [
        {
          "id": "w4-l1",
          "title": "Control loops",
          "minutes": 45
        },
        {
          "id": "w4-l2",
          "title": "Power and batteries",
          "minutes": 40
        },
        {
          "id": "w4-l3",
          "title": "Reliability and fail-safes",
          "minutes": 40
        },
        {
          "id": "w4-l4",
          "title": "Testing and the road to a product",
          "minutes": 35
        }
      ],
      "checkpoints": 8,
      "project": {
        "title": "Mini-project: controller logic · Project 3: automatic watering system",
        "path": "embedded/projects/week-04-control and embedded/projects/project-3-watering-system"
      },
      "quiz": "embedded-04-quiz",
      "quizQuestions": 10
    }
  ]
};
