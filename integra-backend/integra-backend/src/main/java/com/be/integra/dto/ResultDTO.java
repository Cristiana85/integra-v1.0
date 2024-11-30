package com.be.integra.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NonNull;

import java.io.Serializable;
import java.util.*;
import java.util.Map.Entry;
import java.util.stream.Collectors;

@Data
public class ResultDTO<E> implements Serializable {
    private static final long serialVersionUID = 1L;
    public enum Level {
        DEBUG, INFO, WARNING, ERROR, MAIL;
    }
    
    private static final Level DEFAULT_LEVEL = Level.ERROR;
	private static final String END = "\n";
    
    @JsonProperty("mMessage")
    private Map<Level, List<String>> mMessage;
    
    @JsonProperty("mMessageKey")
    private Map<Level, Map<Object, List<String>>> mMessageKey;
    
    @JsonProperty("mContent")
    private Map<String, String> mContent;
    
    private boolean successful;
    private E content;
    private Integer status;
    
    private void init() {
        mContent = new HashMap<>();
        mMessage = new HashMap<>();
        mMessageKey = new HashMap<>();
    }
    
    public ResultDTO() {
        init();
    }
    
    public ResultDTO(E content) {
        init();
        this.content = content;
        this.successful = true;
    }
    @SuppressWarnings({ "unchecked", "rawtypes" })
    public ResultDTO(E content, Comparator comparator) {
        init();
        this.content = content;
        if(content != null) {
            Collections.sort((List)content, comparator);
        }
        this.successful = true;
    }
    
    public ResultDTO(boolean successful) {
        init();
        this.successful = successful;
    }
    
    public void putContent(String key, String value) {
        mContent.put(key, value);
    }
    
    public void append(@NonNull String message) {
        append(DEFAULT_LEVEL, message);     
    }
    
    public void append(@NonNull String message, boolean successful) {
        this.successful = successful;
        append(message);
    }
    
    public void append(@NonNull Level level, String message) {
        List<String> lMessage = mMessage.get(level);
        lMessage = lMessage == null ? new ArrayList<>() : lMessage;
        if (!lMessage.contains(message)) {
            lMessage.add(message);
        }
        mMessage.put(level, lMessage);
    }
    
    public void append(ResultDTO<?> result) {
        if (result != null) {
            successful = successful && result.isSuccessful();
            
            result.getMMessage().forEach((k, v) -> {
                Optional.ofNullable(v).orElse(Collections.emptyList()) .stream().forEach(msg -> {
                    append(k, msg);
                });
            });         
            
            for (Entry<Level, Map<Object, List<String>>> entry : result.getMMessageKey().entrySet()) {
                Map<Object, List<String>> mMessageKeyInner = entry.getValue();
                for (Entry<Object, List<String>> entryInner : mMessageKeyInner.entrySet()) {
                    List<String> lMessage = mMessageKeyInner.get(entryInner.getKey());
                    if (lMessage != null) {
                        for (String message : lMessage) {
                            append(entryInner.getKey(), entry.getKey(), message);
                        }
                    }
                }
            }
            result.getMContent().forEach((k, v) -> mContent.put(k, v));          
        }
    }
    
    public void append(Object row, Level level, String message) {
        Map<Object, List<String>> mMessageKeyInner = mMessageKey.get(level);
        if(mMessageKeyInner==null) {
            mMessageKeyInner = new HashMap<>();
            mMessageKey.put(level, mMessageKeyInner);
        }
        
        List<String> lMessage = mMessageKeyInner.get(row);
        lMessage = lMessage == null ? new ArrayList<>() : lMessage;
        if (!lMessage.contains(message)) {
            lMessage.add(message);
        }
        mMessageKeyInner.put(row, lMessage);
    }
    
    public void append(Level level, String message, String listItem) {
        String messageList = mContent.containsKey(message) ? mContent.get(message) : "";
        messageList += "<li>" + listItem + "</li>";
        mContent.put(message, messageList);     
        
        List<String> lMessage = mMessage.get(level);
        lMessage = lMessage == null ? new ArrayList<>() : lMessage;
        lMessage = lMessage.stream().filter(m -> !m.startsWith(message)).collect(Collectors.toList());
        String newMessage = message + "<ul>" + messageList + "</ul>";
        lMessage.add(newMessage);
        mMessage.put(level, lMessage);
    }
    
	public void appendMessagesOnly(ResultDTO<?> result) {
		if (result != null) {
			Map<Level, List<String>> mMessageInner = result.getMMessage();
			for (Entry<Level, List<String>> entry : mMessageInner.entrySet()) {
				List<String> lMessage = mMessageInner.get(entry.getKey());
				if (lMessage != null) {
					for (String message : lMessage) {
						append(entry.getKey(), message);
					}
				}
			}
			for (Entry<Level, Map<Object, List<String>>> entry : result.getMMessageKey().entrySet()) {
				Map<Object, List<String>> mMessageKeyInner = entry.getValue();
				for (Entry<Object, List<String>> entryInner : mMessageKeyInner.entrySet()) {
					List<String> lMessage = mMessageKeyInner.get(entryInner.getKey());
					if (lMessage != null) {
						for (String message : lMessage) {
							append(entryInner.getKey(), entry.getKey(), message);
						}
					}
				}
			}
			if (result.getMContent() != null) {
				for (String key : result.getMContent().keySet()) {
					mContent.put(key, result.getMContent().get(key));
				}
			}
		}
	}
	
	public String getMessage(Level level) {
		List<String> lMessage = mMessage.get(level);
		StringBuilder builder = new StringBuilder();
		if(lMessage != null) {
			for (String message : lMessage) {
				builder.append(message + END);
			}
		}
		return builder.toString();
	}

	public String getMessage(Level level, String end) {
		List<String> lMessage = mMessage.get(level);
		StringBuilder builder = new StringBuilder();
		if(lMessage != null) {
			for (String message : lMessage) {
				builder.append(message + end);
			}
		}
		return builder.toString();
	}
	
	public String getMessage(String endOfLine) {
		StringBuilder builder = new StringBuilder();
		for (Entry<Level, List<String>> entry : mMessage.entrySet()) {
			List<String> lMessage = entry.getValue();
			if (lMessage != null) {
				for (String message : lMessage) {
					builder.append(message + endOfLine);
				}
			}
		}
		return builder.toString();

	}

	public String getMessage() {
		StringBuilder builder = new StringBuilder();
		for (Entry<Level, List<String>> entry : mMessage.entrySet()) {
			List<String> lMessage = entry.getValue();
			if (lMessage != null) {
				for (String message : lMessage) {
					builder.append(message + END);
				}
			}
		}
		return builder.toString();

	}

    public static <E> ResultDTO<E> getSuccessfulResultDTO() {
        return new ResultDTO<E>(true);
    }
    
	public void appendSubResult(ResultDTO<?> result, String resultMessage) {
		if (result != null) {
			successful = successful && result.isSuccessful();
			Map<Level, List<String>> mMessageInner = result.getMMessage();
			for (Entry<Level, List<String>> entry : mMessageInner.entrySet()) {
				List<String> lMessage = mMessageInner.get(entry.getKey());
				if (lMessage != null) {
					for (String message : lMessage) {
						append(entry.getKey(), resultMessage, message);
					}
				}
			}
			for (Entry<Level, Map<Object, List<String>>> entry : result.getMMessageKey().entrySet()) {
				Map<Object, List<String>> mMessageKeyInner = entry.getValue();
				for (Entry<Object, List<String>> entryInner : mMessageKeyInner.entrySet()) {
					List<String> lMessage = mMessageKeyInner.get(entryInner.getKey());
					if (lMessage != null) {
						for (String message : lMessage) {
							append(entryInner.getKey(), entry.getKey(), message);
						}
					}
				}
			}
			if (result.getMContent() != null) {
				for (String key : result.getMContent().keySet()) {
					mContent.put(key, result.getMContent().get(key));
				}
			}
		}
	}

}
