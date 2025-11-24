package com.be.integra.controller;

public class EndPoint {
    public static final String PREFIX = "api";

    public static class Test {
        public static final String ROOT = PREFIX + "/test";
    }

    public static class Project {
        public static final String ROOT = PREFIX + "/projects";
        public static final String ID = "/{projectId}";
        public static final String CREATE_SIMULATION = ID + "/createSimulation";
    }
}
