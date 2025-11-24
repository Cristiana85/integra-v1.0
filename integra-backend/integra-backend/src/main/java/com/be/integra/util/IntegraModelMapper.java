package com.be.integra.util;

import com.be.integra.dto.ResultDTO;
import org.modelmapper.ModelMapper;
import org.modelmapper.internal.util.Assert;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class IntegraModelMapper extends ModelMapper {
	
//	public FrameworkModelMapper() {
//		super();
//		getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
//	}

	public <D> List<D> mapList(List<?> list, Class<D> destinationType) {
		List<D> ret = null;
		if (Optional.ofNullable(list).isPresent()) {
			ret = list.stream().map(item -> map(item, destinationType)).collect(Collectors.toList());
		}
		return ret;
	}
	
	public <D> Set<D> mapSet(Set<?> set, Class<D> destinationType) {
		Set<D> ret = null;
		if (Optional.ofNullable(set).isPresent()) {
			ret = set.stream().map(item -> map(item, destinationType)).collect(Collectors.toSet());
		}
		return ret;
	}
	
	public <D> D map(Object source, Class<D> destinationType) {
		D ret = null;
		Assert.notNull(destinationType, "destinationType");
		if (Optional.ofNullable(source).isPresent()) {
			ret = super.map(source, destinationType);
		}
	    return ret;
	}
	
	public <D> ResultDTO<D> mapResult(ResultDTO<?> source, Class<D> destinationType) {
		ResultDTO<D> ret = null;
		if (Optional.ofNullable(source).isPresent()) {
			ret = new ResultDTO<>(true);
			ret.append(source);
			ret.setContent(map(source.getContent(), destinationType));
		}
		return ret;
	}
	
	public <D> ResultDTO<List<D>> mapResultList(ResultDTO<?> source, Class<D> destinationType) {
		ResultDTO<List<D>> ret = null;
		if (Optional.ofNullable(source).isPresent()) {
			ret = new ResultDTO<>(true);
			ret.append(source);
			ret.setContent(mapList((List<?>)source.getContent(), destinationType));
		}
		return ret;
	}
	
	public <D> ResultDTO<Set<D>> mapResultSet(ResultDTO<?> source, Class<D> destinationType) {
		ResultDTO<Set<D>> ret = null;
		if (Optional.ofNullable(source).isPresent()) {
			ret = new ResultDTO<>(true);
			ret.append(source);
			ret.setContent(mapSet((Set<?>)source.getContent(), destinationType));
		}
		return ret;
	}
	
	public <D> Optional<D> mapOptional(Optional<?> optional, Class<D> destinationType) {
		Optional<D> ret = null;
		if (optional != null) {
			if (optional.isPresent()) {
				ret = Optional.of(map(optional.get(), destinationType));
			} else {
				ret = Optional.empty();
			}
		}
		return ret;
	}
}
