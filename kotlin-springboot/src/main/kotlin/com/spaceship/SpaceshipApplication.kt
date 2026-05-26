package com.spaceship

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class SpaceshipApplication

fun main(args: Array<String>) {
    runApplication<SpaceshipApplication>(*args)
}
